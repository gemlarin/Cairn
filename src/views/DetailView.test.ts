import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import DetailView from "./DetailView.vue";
import { useSearchStore } from "@/stores/search";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";

const mockGetById = vi.fn();
const mockResolveNpsItem = vi.fn();

vi.mock("@/api/nps", () => ({
  getById: (...args: unknown[]) => mockGetById(...args),
  resolveNpsItem: (...args: unknown[]) => mockResolveNpsItem(...args),
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

async function mountDetail(options?: {
  id?: string;
  seedResult?: boolean;
}) {
  const id = options?.id ?? "park-1";
  const pinia = createPinia();
  setActivePinia(pinia);

  if (options?.seedResult) {
    useSearchStore().results = [
      {
        id,
        fullName: "Acadia National Park",
        images: [
          {
            url: "https://example.com/a.jpg",
            altText: "Acadia",
            title: "",
            caption: "",
          },
        ],
      },
    ];
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "search", component: { template: "<div />" } },
      {
        path: "/item/:category/:id",
        name: "detail",
        component: DetailView,
        props: true,
      },
    ],
  });

  const wrapper = mount(DetailView, {
    props: {
      id,
      category: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    },
    global: {
      plugins: [pinia, router],
      stubs: { Details: true, AuthModal: true },
    },
  });
  await flushPromises();

  return { wrapper, searchStore: useSearchStore(), router };
}

describe("DetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetById.mockResolvedValue(null);
    mockResolveNpsItem.mockResolvedValue(null);
  });

  it("shows the cached search result title", async () => {
    const { wrapper } = await mountDetail({ seedResult: true });
    expect(wrapper.get("img").attributes("alt")).toBe("Acadia National Park");
  });

  it("fetches from NPS when not in the search cache", async () => {
    mockGetById.mockResolvedValue({
      id: "park-1",
      fullName: "Zion National Park",
    });
    const { wrapper } = await mountDetail();
    expect(mockGetById).toHaveBeenCalledWith(
      AVAILABLE_SEARCH_CATEGORIES.PARKS,
      "park-1",
    );
    expect(wrapper.get("img").attributes("alt")).toBe("Zion National Park");
  });

  it("navigates back to search", async () => {
    const { wrapper, router } = await mountDetail({ seedResult: true });
    const push = vi.spyOn(router, "push");
    await wrapper.get("button").trigger("click");
    expect(push).toHaveBeenCalledWith({ name: "search" });
  });
});
