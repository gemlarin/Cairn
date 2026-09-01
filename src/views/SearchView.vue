<script setup lang="ts">
import AuthModal from "@/components/AuthModal/AuthModal.vue";
import { searchNPS } from "@/api/nps";
import Header from "@/components/Header/Header.vue";
import {
  DEFAULT_SEARCH_CATEGORY,
  type AvailableSearchCategories,
} from "@/types/nps";
import SearchForm from "@/components/SearchForm/SearchForm.vue";
import Results from "@/components/Results/Results.vue";
import { useSearchStore } from "@/stores/search";
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";

const searchStore = useSearchStore();
const authStore = useAuthStore();
const { closeSignInModal } = authStore;

// Field Log used to bleed into results; keep search blank until the user searches
onMounted(() => {
  if (!searchStore.searched) {
    searchStore.clearResults();
  }
});

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
  <AuthModal v-if="authStore.isOpenSignInModal" @close="closeSignInModal" />
  <Header />
  <SearchForm @init-search="onSearch" />
  <div class="px-3 sm:px-5 py-5">
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
