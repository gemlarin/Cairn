import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import Header from "./Header.vue";
import { useAuthStore } from "@/stores/auth";
import { useVisitsStore } from "@/stores/visits";

async function mountHeader(
  routeName: "search" | "fieldlog" = "search",
  options?: { signedIn?: boolean; visitCount?: number },
) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore();
  const visitsStore = useVisitsStore();
  if (options?.signedIn) {
    authStore.isSignedIn = true;
    authStore.user = { id: "u1", email: "a@b.com" };
  }
  if (options?.visitCount) {
    visitsStore.visited = Array.from({ length: options.visitCount }, (_, i) =>
      String(i),
    );
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "search", component: { template: "<div />" } },
      {
        path: "/fieldlog",
        name: "fieldlog",
        component: { template: "<div />" },
      },
    ],
  });
  await router.push(routeName === "fieldlog" ? "/fieldlog" : "/");
  await router.isReady();

  return {
    wrapper: mount(Header, {
      global: { plugins: [pinia, router] },
    }),
    authStore,
    visitsStore,
  };
}

describe("Header", () => {
  it("renders the brand", async () => {
    const { wrapper } = await mountHeader();
    expect(wrapper.get("#title").text()).toBe("Cairn");
    expect(wrapper.get("#subtitle").text()).toContain("National Parks");
  });

  it("shows Sign In when logged out on search", async () => {
    const { wrapper } = await mountHeader("search");
    expect(wrapper.text()).toContain("Sign In");
    expect(wrapper.text()).not.toContain("Sign Out");
  });

  it("opens the sign-in modal", async () => {
    const { wrapper, authStore } = await mountHeader("search");
    await wrapper.get("button").trigger("click");
    expect(authStore.isOpenSignInModal).toBe(true);
  });

  it("shows Field Log count when signed in on search", async () => {
    const { wrapper } = await mountHeader("search", {
      signedIn: true,
      visitCount: 3,
    });
    expect(wrapper.text()).toContain("Field Log");
    expect(wrapper.text()).toContain("(3)");
    expect(wrapper.text()).toContain("Sign Out");
  });

  it("shows Search parks link on field log route", async () => {
    const { wrapper } = await mountHeader("fieldlog", { signedIn: true });
    expect(wrapper.text()).toContain("Search parks");
    expect(wrapper.text()).toContain("Field Log");
  });
});
