import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createMemoryHistory, createRouter } from "vue-router";
import { useSearchStore } from "@/stores/search";
import SearchForm from "@/components/SearchForm/SearchForm.vue";
import SearchView from "./SearchView.vue";

const mockSearchNPS = vi.fn();

vi.mock("@/api/nps", () => ({
  searchNPS: (...args: unknown[]) => mockSearchNPS(...args),
}));

function mountSearchView(stubs: Record<string, boolean> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", name: "search", component: { template: "<div />" } }],
  });

  return mount(SearchView, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
        }),
      ],
      stubs: {
        Results: true,
        ...stubs,
      },
    },
  });
}

describe("SearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchNPS.mockReset();
  });

  it("handles a successful search", async () => {
    const mockData = [{ id: "yell", name: "Yellowstone National Park" }];
    mockSearchNPS.mockResolvedValue(mockData);

    const wrapper = mountSearchView();
    const store = useSearchStore();

    const searchForm = wrapper.findComponent(SearchForm);
    await searchForm.vm.$emit("init-search", "Yellowstone", 10, "parks");
    await flushPromises();

    expect(store.searched).toBe(true);
    expect(store.term).toBe("Yellowstone");
    expect(store.category).toBe("parks");
    expect(mockSearchNPS).toHaveBeenCalledWith("Yellowstone", 10, "parks");
    expect(store.results).toEqual(mockData);
    expect(store.loading).toBe(false);
    expect(store.error).toBe("");
  });

  it("handles an API error", async () => {
    mockSearchNPS.mockRejectedValue(new Error("Network connection lost"));

    const wrapper = mountSearchView();
    const store = useSearchStore();

    const searchForm = wrapper.findComponent(SearchForm);
    await searchForm.vm.$emit("init-search", "Yosemite", 5, "activities");
    await flushPromises();

    expect(store.error).toBe("Network connection lost");
    expect(store.results).toEqual([]);
    expect(store.loading).toBe(false);
  });
});
