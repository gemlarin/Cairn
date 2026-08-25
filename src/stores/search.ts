import { defineStore } from "pinia";
import { ref } from "vue";
import {
  DEFAULT_SEARCH_CATEGORY,
  type AvailableSearchCategories,
  type NpsResult,
} from "@/types/nps";

export const useSearchStore = defineStore("search", () => {
  const results = ref<NpsResult[]>([]);
  const category = ref<AvailableSearchCategories>(DEFAULT_SEARCH_CATEGORY);
  const term = ref("");
  const error = ref("");
  const searched = ref(false);
  const loading = ref(false);

  function findById(id: string): NpsResult | undefined {
    return results.value.find(
      (result) => result.id === id || result.parkCode === id,
    );
  }

  return {
    results,
    category,
    term,
    error,
    searched,
    loading,
    findById,
  };
});
