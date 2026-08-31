import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import Details from "./Details.vue";
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from "@/stores/search";
import { useVisitsStore } from "@/stores/visits";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";

vi.mock("@/api/nps", () => ({
  getById: vi.fn().mockResolvedValue(null),
  resolveNpsItem: vi.fn().mockResolvedValue(null),
  getByIds: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}));

async function mountDetails(options?: {
  signedIn?: boolean;
  addVisited?: ReturnType<typeof vi.fn>;
}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", name: "search", component: { template: "<div />" } }],
  });

  const authStore = useAuthStore();
  const visitsStore = useVisitsStore();
  const searchStore = useSearchStore();

  if (options?.signedIn) authStore.isSignedIn = true;
  const addVisitedSpy =
    options?.addVisited ??
    vi.spyOn(visitsStore, "addVisited").mockResolvedValue(undefined);

  searchStore.results = [
    {
      id: "park-1",
      fullName: "Yosemite National Park",
      designation: "National Park",
      states: "CA",
      description: "A beautiful park",
    },
  ];

  const wrapper = mount(Details, {
    props: {
      id: "park-1",
      category: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    },
    global: { plugins: [pinia, router] },
  });
  await flushPromises();

  return { wrapper, authStore, visitsStore, addVisitedSpy };
}

describe("Details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders park title and meta from the search result", async () => {
    const { wrapper } = await mountDetails();
    expect(wrapper.text()).toContain("Yosemite National Park");
    expect(wrapper.text()).toContain("CA");
    expect(wrapper.text()).toContain("National Park");
  });

  it("opens sign-in when an unsigned user toggles visited", async () => {
    const { wrapper, authStore } = await mountDetails();
    await wrapper.get('button[aria-label="Mark as visited"]').trigger("click");
    expect(authStore.isOpenSignInModal).toBe(true);
  });

  it("calls addVisited when a signed-in user marks visited", async () => {
    const { wrapper, addVisitedSpy } = await mountDetails({ signedIn: true });
    await wrapper.get('button[aria-label="Mark as visited"]').trigger("click");
    await flushPromises();
    expect(addVisitedSpy).toHaveBeenCalledWith(
      "park-1",
      AVAILABLE_SEARCH_CATEGORIES.PARKS,
    );
  });
});
