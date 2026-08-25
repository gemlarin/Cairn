<script setup lang="ts">
import { searchNPS } from "@/api/nps";
import Header from "@/components/Header/Header.vue";
import {
  DEFAULT_SEARCH_CATEGORY,
  type AvailableSearchCategories,
} from "@/types/nps";
import SearchForm from "@/components/SearchForm/SearchForm.vue";
import Results from "@/components/Results/Results.vue";
import { useSearchStore } from "@/stores/search";
import { storeToRefs } from "pinia";

const searchStore = useSearchStore();
const { results, error, searched, loading, term, category } =
  storeToRefs(searchStore);

async function onSearch(
  searchTerm: string,
  numberOfResults: number,
  searchCategory: AvailableSearchCategories = DEFAULT_SEARCH_CATEGORY,
) {
  error.value = "";
  searched.value = true;
  loading.value = true;
  term.value = searchTerm;
  category.value = searchCategory;
  try {
    results.value = await searchNPS(
      searchTerm,
      numberOfResults,
      searchCategory,
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Search failed";
    results.value = [];
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-5">
    <Header />
    <SearchForm @init-search="onSearch" />
    <Results :error :searched :term :loading :results :category />
  </div>
</template>
