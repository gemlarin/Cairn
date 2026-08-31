import { defineStore } from "pinia";
import { ref } from "vue";
import {
  DEFAULT_SEARCH_CATEGORY,
  type AvailableSearchCategories,
  type NpsResult,
} from "@/types/nps";

function idEquals(a: string | undefined, b: string): boolean {
  if (!a) return false;
  return a === b || a.toLowerCase() === b.toLowerCase();
}

export const useSearchStore = defineStore("search", () => {
  const results = ref<NpsResult[]>([]);
  /** Detail/Field Log lookups — not shown on the search page. */
  const itemCache = ref<NpsResult[]>([]);
  const category = ref<AvailableSearchCategories>(DEFAULT_SEARCH_CATEGORY);
  const term = ref("");
  const error = ref("");
  const searched = ref(false);
  const loading = ref(false);

  function findIn(list: NpsResult[], id: string): NpsResult | undefined {
    return list.find(
      (result) => idEquals(result.id, id) || idEquals(result.parkCode, id),
    );
  }

  function findById(id: string): NpsResult | undefined {
    return findIn(results.value, id) || findIn(itemCache.value, id);
  }

  /** Cache for Detail/Field Log only — does not affect search results UI. */
  function cacheResults(items: NpsResult[]) {
    for (const item of items) {
      const key = item.id || item.parkCode;
      if (!key) continue;
      const idx = itemCache.value.findIndex(
        (result) =>
          idEquals(result.id, key) || idEquals(result.parkCode, key),
      );
      if (idx >= 0) itemCache.value[idx] = item;
      else itemCache.value.push(item);
    }
  }

  function clearResults() {
    results.value = [];
    searched.value = false;
    term.value = "";
    error.value = "";
  }

  return {
    results,
    itemCache,
    category,
    term,
    error,
    searched,
    loading,
    findById,
    cacheResults,
    clearResults,
  };
});
