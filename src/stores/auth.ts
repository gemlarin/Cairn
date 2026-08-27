// auth store
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

export type SignUpResult =
  | { status: "signed_in" }
  | { status: "confirm_email" };

function toAuthUser(user: User): AuthUser {
  const metaName = user.user_metadata?.name;
  return {
    id: user.id,
    email: user.email,
    name: typeof metaName === "string" ? metaName : undefined,
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isSignedIn: false,
    user: null as AuthUser | null,
    isOpenSignInModal: false,
  }),
  actions: {
    init() {
      // Only onAuthStateChange (includes INITIAL_SESSION). Do not also call
      // getSession().then — a late null result can wipe state after sign-in.
      supabase.auth.onAuthStateChange((_event, session) => {
        // Defer so we never update Pinia synchronously inside the auth lock
        setTimeout(() => {
          this.setSessionUser(session?.user ?? null);
        }, 0);
      });
    },
    setSessionUser(user: User | null) {
      this.user = user ? toAuthUser(user) : null;
      this.isSignedIn = !!user;
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
      // TODO later: load notes / visited from DB
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
