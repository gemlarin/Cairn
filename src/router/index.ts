import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import SearchView from "@/views/SearchView.vue";
import DetailView from "@/views/DetailView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "search",
      component: SearchView,
    },
    {
      path: "/item/:category/:id",
      name: "detail",
      component: DetailView,
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0, left: 0 };
  },
});

router.afterEach(() => {
  const authStore = useAuthStore();
  if (authStore.isOpenSignInModal) {
    authStore.closeSignInModal();
  }
});
