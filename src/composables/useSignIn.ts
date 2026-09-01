// signing composable
import { useAuthStore } from "@/stores/auth";

export const useSignin = () => {
  const authStore = useAuthStore();
  return authStore.signIn;
};

export const useSignout = () => {
  const authStore = useAuthStore();
  return authStore.signout;
};

export const useIsSignedIn = () => {
  const authStore = useAuthStore();
  return authStore.isSignedIn;
};
