import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useVisitsStore } from "@/stores/visits";
import { useSearchStore } from "@/stores/search";
import { getByIds, resolveNpsItem } from "@/api/nps";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";

vi.mock("@/api/nps", () => ({
  getByIds: vi.fn(),
  resolveNpsItem: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe("visitsStore.loadVisitedDetails", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("uses the search cache and skips NPS when everything is cached", async () => {
    const visitsStore = useVisitsStore();
    const searchStore = useSearchStore();
    const park = {
      id: "abc",
      fullName: "Cached Park",
      parkCode: "cach",
    };

    visitsStore.visited = ["abc"];
    visitsStore.categories = {
      abc: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    };
    searchStore.cacheResults([park]);

    await visitsStore.loadVisitedDetails();

    expect(getByIds).not.toHaveBeenCalled();
    expect(resolveNpsItem).not.toHaveBeenCalled();
    expect(visitsStore.visitedItems[0]?.result?.fullName).toBe("Cached Park");
    expect(visitsStore.detailsLoading).toBe(false);
  });

  it("fetches only ids missing from cache", async () => {
    const visitsStore = useVisitsStore();
    const searchStore = useSearchStore();

    visitsStore.visited = ["cached", "fresh"];
    visitsStore.categories = {
      cached: AVAILABLE_SEARCH_CATEGORIES.PARKS,
      fresh: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    };
    searchStore.cacheResults([
      { id: "cached", fullName: "Already Here", parkCode: "c1" },
    ]);

    vi.mocked(getByIds).mockResolvedValue([
      { id: "fresh", fullName: "From NPS", parkCode: "f1" },
    ]);

    await visitsStore.loadVisitedDetails();

    expect(getByIds).toHaveBeenCalledTimes(1);
    expect(getByIds).toHaveBeenCalledWith(AVAILABLE_SEARCH_CATEGORIES.PARKS, [
      "fresh",
    ]);
    expect(visitsStore.visitedItems.map((item) => item.result?.fullName)).toEqual(
      ["Already Here", "From NPS"],
    );
  });
});
