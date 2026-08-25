<script setup lang="ts">
import type { AvailableSearchCategories, NpsResult } from "@/types/nps";
import ParkCard from "@/components/ParkCard/ParkCard.vue";

defineProps<{
  error: string;
  loading: boolean;
  results: NpsResult[];
  searched: boolean;
  term: string;
  category: AvailableSearchCategories;
}>();
</script>
<template>
  <div id="results-area" class="mt-10 pb-20">
    <div class="flex items-center justify-center">
      <div
        v-if="loading"
        class="w-8 h-8 border-4 border-ring border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <p
      v-if="results.length > 0 && !loading"
      class="results text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-6"
    >
      {{ results.length }} RESULTS
    </p>
    <p v-if="error" id="error" class="text-sm text-accent text-center py-12">
      {{ error }}
    </p>
    <p
      v-if="searched && !loading && results.length === 0 && !error"
      className="text-sm text-muted-foreground text-center py-16"
    >
      No results found for "{{ term }}."
    </p>
    <p
      v-if="!searched && !loading"
      className="text-sm text-muted-foreground text-center py-16 leading-relaxed"
    >
      Search parks, tours, and things to do across the United States.
      <br />
      <span className="text-xs opacity-70">
        Try "Yosemite," "Alaska," or "canyon."
      </span>
    </p>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <ParkCard
        v-if="!loading"
        v-for="result in results"
        :result
        :category="category"
        :key="result.id"
      />
    </div>
  </div>
</template>
