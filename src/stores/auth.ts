// auth store
import { defineStore } from "pinia";

// Replace with Supabase User (or your own type) when auth is wired
export type AuthUser = {
  id: string;
  email?: string;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isSignedIn: false,
    user: null as AuthUser | null,
    isOpenSignInModal: false,
  }),
  actions: {
    signin(user: AuthUser) {
      // TODO: Implement Supabase auth
      // Sign in user
      // Download user's notes from Supabase
      // Download user's visited places from Supabase
      this.isSignedIn = true;
      this.user = user;
    },
    signout() {
      this.isSignedIn = false;
      this.user = null;
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
