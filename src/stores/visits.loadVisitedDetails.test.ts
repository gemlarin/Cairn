import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useVisitsStore } from "@/stores/visits";
import { useSearchStore } from "@/stores/search";
import { getByIds } from "@/api/nps";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";
import { supabase } from "@/lib/supabase";

vi.mock("@/api/nps", () => ({
  getByIds: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
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
    expect(supabase.from).not.toHaveBeenCalled();
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
    expect(supabase.from).not.toHaveBeenCalled();
    expect(visitsStore.visitedItems.map((item) => item.result?.fullName)).toEqual(
      ["Already Here", "From NPS"],
    );
  });

  it("batches uncategorized ids across NPS categories without hydration upserts", async () => {
    const visitsStore = useVisitsStore();

    visitsStore.visited = ["park-1", "camp-1"];
    visitsStore.categories = {};

    vi.mocked(getByIds).mockImplementation(async (category, ids) => {
      if (
        category === AVAILABLE_SEARCH_CATEGORIES.PARKS &&
        ids.includes("park-1")
      ) {
        return [{ id: "park-1", fullName: "Park One", parkCode: "p1" }];
      }
      if (
        category === AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS &&
        ids.includes("camp-1")
      ) {
        return [{ id: "camp-1", fullName: "Camp One", parkCode: "c1" }];
      }
      return [];
    });

    await visitsStore.loadVisitedDetails();

    expect(supabase.from).not.toHaveBeenCalled();
    expect(visitsStore.visitedItems.map((item) => item.result?.fullName)).toEqual(
      ["Park One", "Camp One"],
    );
    expect(visitsStore.visitedItems[1]?.category).toBe(
      AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS,
    );
  });

  it("retries other categories when the stored category misses", async () => {
    const visitsStore = useVisitsStore();

    visitsStore.visited = ["misfiled"];
    visitsStore.categories = {
      misfiled: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    };

    vi.mocked(getByIds).mockImplementation(async (category) => {
      if (category === AVAILABLE_SEARCH_CATEGORIES.PLACES) {
        return [{ id: "misfiled", fullName: "Hidden Place", parkCode: "hp" }];
      }
      return [];
    });

    await visitsStore.loadVisitedDetails();

    expect(supabase.from).not.toHaveBeenCalled();
    expect(visitsStore.visitedItems[0]?.result?.fullName).toBe("Hidden Place");
    expect(visitsStore.visitedItems[0]?.category).toBe(
      AVAILABLE_SEARCH_CATEGORIES.PLACES,
    );
  });
});
