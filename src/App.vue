<script setup lang="ts">
import { ref } from "vue";
import { searchParks } from "./api/nps";
import type { NpsPark } from "./types/nps";
import Header from "./components/Header.vue";
import SearchForm from "./components/SearchForm.vue";
import Results from "./components/Results.vue";
import ParkCard from "./components/ParkCard.vue";

const parks = ref<NpsPark[]>([]);
const error = ref("");
const searched = ref(false);
const loading = ref(false);
const term = ref("");

async function onSearch(searchTerm: string) {
  error.value = "";
  searched.value = true;
  loading.value = true;
  term.value = searchTerm;
  try {
    parks.value = await searchParks(searchTerm);
    console.log(parks.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Search failed";
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <Header />
  <SearchForm @init-search="onSearch" />
  <Results :error :searched :term :loading :parks />
</template>
<style lang="scss" scoped></style>
