import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createMemoryHistory, createRouter } from "vue-router";
import FieldLogView from "./FieldLogView.vue";
import { useVisitsStore, type VisitedItem } from "@/stores/visits";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  FIELD_LOG_EMPTY_TITLE,
  FIELD_LOG_LOADING,
  FIELD_LOG_NO_NOTES,
  FIELD_LOG_SEARCH_PARKS,
  RESULTS_PER_PAGE,
} from "@/types/nps";

vi.mock("@/api/nps", () => ({
  getByIds: vi.fn().mockResolvedValue([]),
  resolveNpsItem: vi.fn().mockResolvedValue(null),
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

function sampleItem(overrides: Partial<VisitedItem> = {}): VisitedItem {
  return {
    id: "1",
    category: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    result: {
      id: "1",
      fullName: "Rocky Mountain National Park",
      designation: "National Park",
      states: "CO",
    },
    note: null,
    savedOn: null,
    ...overrides,
  };
}

async function mountFieldLog(
  patch?: Partial<{
    loading: boolean;
    detailsLoading: boolean;
    visitedItems: VisitedItem[];
    fetchError: string | null;
  }>,
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "search", component: { template: "<div />" } },
      { path: "/fieldlog", name: "fieldlog", component: FieldLogView },
      {
        path: "/item/:category/:id",
        name: "detail",
        component: { template: "<div />" },
      },
    ],
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      visits: {
        loading: patch?.loading ?? false,
        detailsLoading: patch?.detailsLoading ?? false,
        visitedItems: patch?.visitedItems ?? [],
        fetchError: patch?.fetchError ?? null,
        visited: [],
        categories: {},
        notes: [],
      },
    },
  });

  const wrapper = mount(FieldLogView, {
    global: {
      plugins: [router, pinia],
      stubs: { Header: true, Pagination: true },
    },
  });
  await flushPromises();

  return { wrapper, visitsStore: useVisitsStore(), router };
}

describe("FieldLogView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads visits on mount", async () => {
    const { visitsStore } = await mountFieldLog();
    expect(visitsStore.loadFromSupabase).toHaveBeenCalled();
    expect(visitsStore.loadVisitedDetails).toHaveBeenCalled();
  });

  it("shows loading state while busy", async () => {
    const { wrapper } = await mountFieldLog({ loading: true });
    expect(wrapper.text()).toContain(FIELD_LOG_LOADING);
  });

  it("shows empty state when there are no visits", async () => {
    const { wrapper } = await mountFieldLog({ visitedItems: [] });
    expect(wrapper.text()).toContain(FIELD_LOG_EMPTY_TITLE);
    expect(wrapper.text()).toContain(FIELD_LOG_SEARCH_PARKS);
  });

  it("renders visited items with notes placeholder", async () => {
    const { wrapper } = await mountFieldLog({
      visitedItems: [sampleItem()],
    });
    expect(wrapper.text()).toContain("Rocky Mountain National Park");
    expect(wrapper.text()).toContain(FIELD_LOG_NO_NOTES);
  });

  it("paginates when visits exceed RESULTS_PER_PAGE", async () => {
    const visitedItems = Array.from(
      { length: RESULTS_PER_PAGE + 2 },
      (_, i) =>
        sampleItem({
          id: String(i),
          result: { id: String(i), fullName: `Park ${i}` },
        }),
    );
    const { wrapper } = await mountFieldLog({ visitedItems });
    expect(wrapper.findAll("button.w-full").length).toBe(RESULTS_PER_PAGE);
    expect(wrapper.findComponent({ name: "Pagination" }).exists()).toBe(true);
  });

  it("navigates to detail on item click", async () => {
    const { wrapper, router } = await mountFieldLog({
      visitedItems: [
        sampleItem({
          id: "romo",
          result: { id: "romo", fullName: "Rocky Mountain National Park" },
          note: "Great hike",
          savedOn: Date.now(),
        }),
      ],
    });
    const push = vi.spyOn(router, "push");
    await wrapper.get("button.w-full").trigger("click");
    expect(push).toHaveBeenCalledWith({
      name: "detail",
      params: { category: AVAILABLE_SEARCH_CATEGORIES.PARKS, id: "romo" },
    });
  });
});
