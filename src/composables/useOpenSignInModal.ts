// open sign in modal composable
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

export function useSignInModal() {
  const authStore = useAuthStore();
  const { isOpenSignInModal } = storeToRefs(authStore);

  return {
    isOpenSignInModal,
    openSignInModal: authStore.openSignInModal,
    closeSignInModal: authStore.closeSignInModal,
    toggleSignInModal: authStore.toggleSignInModal,
  };
}
