// auth store
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { AuthUser, SignUpResult } from "@/types/nps";
import { useVisitsStore } from "@/stores/visits";

function toAuthUser(user: User): AuthUser {
  const metaName = user.user_metadata?.name;
  return {
    id: user.id,
    email: user.email,
    name: typeof metaName === "string" ? metaName : undefined,
  };
}

/** Resolved once the first auth session event has been applied. */
let resolveAuthReady: (() => void) | null = null;
const authReadyPromise = new Promise<void>((resolve) => {
  resolveAuthReady = resolve;
});

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isSignedIn: false,
    user: null as AuthUser | null,
    isOpenSignInModal: false,
    /** False until the first onAuthStateChange (INITIAL_SESSION) settles. */
    authReady: false,
  }),
  actions: {
    init() {
      // Only onAuthStateChange (includes INITIAL_SESSION). Do not also call
      // getSession().then — a late null result can wipe state after sign-in.
      supabase.auth.onAuthStateChange((_event, session) => {
        // Defer so we never update Pinia synchronously inside the auth lock
        setTimeout(() => {
          this.setSessionUser(session?.user ?? null);
          if (!this.authReady) {
            this.authReady = true;
            resolveAuthReady?.();
          }
        }, 0);
      });
    },
    /** Router guards wait here so refresh does not treat a restoring session as signed out. */
    waitUntilReady(): Promise<void> {
      if (this.authReady) return Promise.resolve();
      return authReadyPromise;
    },
    setSessionUser(user: User | null) {
      const prevId = this.user?.id ?? null;
      const nextId = user?.id ?? null;
      this.user = user ? toAuthUser(user) : null;
      this.isSignedIn = !!user;

      const visitsStore = useVisitsStore();
      if (!user) {
        visitsStore.clear();
        return;
      }
      // Avoid re-fetch on TOKEN_REFRESHED / duplicate auth events (same user)
      if (nextId !== prevId) {
        void visitsStore.loadFromSupabase();
      }
    },
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (/email not confirmed/i.test(error.message)) {
          throw new Error("EMAIL_NOT_CONFIRMED");
        }
        throw error;
      }
      const user = data.session?.user ?? data.user;
      if (!user) throw new Error("No user returned");
      this.setSessionUser(user);
    },
    async signUp(
      email: string,
      password: string,
      name?: string,
    ): Promise<SignUpResult> {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: name ? { data: { name } } : undefined,
      });
      if (error) throw error;
      if (!data.user) throw new Error("No user returned");
      // Confirm-email ON → account exists, no session until they confirm
      if (!data.session) {
        return { status: "confirm_email" };
      }
      this.setSessionUser(data.user);
      return { status: "signed_in" };
    },
    async signout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.setSessionUser(null);
    },
    openSignInModal() {
      this.isOpenSignInModal = true;
    },
    closeSignInModal() {
      this.isOpenSignInModal = false;
    },
    toggleSignInModal() {
      this.isOpenSignInModal = !this.isOpenSignInModal;
    },
  },
});
