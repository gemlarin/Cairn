import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import SearchView from "@/views/SearchView.vue";
import DetailView from "@/views/DetailView.vue";
import FieldLogView from "@/views/FieldLogView.vue";
import {
  APP_TITLE,
  APP_TITLE_FIELD_LOG,
  APP_TITLE_SEARCH,
} from "@/types/nps";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "search",
      component: SearchView,
      meta: { title: APP_TITLE_SEARCH },
    },
    {
      path: "/item/:category/:id",
      name: "detail",
      component: DetailView,
      props: true,
      meta: { title: APP_TITLE },
    },
    {
      path: "/fieldlog",
      name: "fieldlog",
      meta: {
        requiresAuth: true,
        title: APP_TITLE_FIELD_LOG,
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
  document.title = to.meta.title ?? APP_TITLE;
});
