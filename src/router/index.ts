import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import SearchView from "@/views/SearchView.vue";
import DetailView from "@/views/DetailView.vue";
import FieldLogView from "@/views/FieldLogView.vue";

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
    {
      path: "/fieldlog",
      name: "fieldlog",
      meta: {
        requiresAuth: true,
      },
      component: FieldLogView,
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0, left: 0 };
  },
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isSignedIn) {
    authStore.openSignInModal(); // optional: prompt sign-in
    return { name: "search" }; // or return false to cancel
  }
});
router.afterEach((to) => {
  const authStore = useAuthStore();
  if (authStore.isOpenSignInModal) {
    authStore.closeSignInModal();
  }
});
