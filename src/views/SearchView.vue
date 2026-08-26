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

const searchStore = useSearchStore();

async function onSearch(
  searchTerm: string,
  numberOfResults: number,
  searchCategory: AvailableSearchCategories = DEFAULT_SEARCH_CATEGORY,
) {
  searchStore.error = "";
  searchStore.searched = true;
  searchStore.loading = true;
  searchStore.term = searchTerm;
  searchStore.category = searchCategory;
  try {
    searchStore.results = await searchNPS(
      searchTerm,
      numberOfResults,
      searchCategory,
    );
  } catch (e) {
    searchStore.error = e instanceof Error ? e.message : "Search failed";
    searchStore.results = [];
  } finally {
    searchStore.loading = false;
  }
}
</script>

<template>
  <div class="p-5">
    <Header />
    <SearchForm @init-search="onSearch" />
    <Results
      :error="searchStore.error"
      :searched="searchStore.searched"
      :term="searchStore.term"
      :loading="searchStore.loading"
      :results="searchStore.results"
      :category="searchStore.category"
    />
  </div>
</template>
