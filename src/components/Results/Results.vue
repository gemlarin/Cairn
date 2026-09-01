<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AvailableSearchCategories, NpsResult } from "@/types/nps";
import {
  RESULTS_PER_PAGE,
  RESULTS_FOR_LABEL,
  RESULTS_EMPTY_PREFIX,
  RESULTS_PROMPT,
  RESULTS_PROMPT_HINT,
  RESULTS_LOADING,
} from "@/types/nps";
import ParkCard from "@/components/ParkCard/ParkCard.vue";
import Pagination from "@/components/Pagination/Pagination.vue";

const props = defineProps<{
  error: string;
  loading: boolean;
  results: NpsResult[];
  searched: boolean;
  term: string;
  category: AvailableSearchCategories;
}>();

const page = ref(1);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.results.length / RESULTS_PER_PAGE)),
);

const pageResults = computed(() => {
  const start = (page.value - 1) * RESULTS_PER_PAGE;
  return props.results.slice(start, start + RESULTS_PER_PAGE);
});

watch(
  () => props.results,
  () => {
    page.value = 1;
  },
);
</script>
<template>
  <div
    id="results-area"
    class="mt-10 pb-20"
    :aria-busy="loading"
    aria-live="polite"
  >
    <p v-if="loading" class="sr-only">{{ RESULTS_LOADING }}</p>
    <div class="flex items-center justify-center" aria-hidden="true">
      <div
        v-if="loading"
        class="w-8 h-8 border-4 border-ring border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <p
      v-if="results.length > 0 && !loading"
      class="results text-xs sm:text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-6"
    >
      {{ results.length }} {{ RESULTS_FOR_LABEL }}
      <span class="text-muted-foreground font-bold">"{{ term }}".</span>
    </p>
    <p
      v-if="error"
      id="error"
      role="alert"
      class="text-sm text-accent text-center py-12"
    >
      {{ error }}
    </p>
    <p
      v-if="searched && !loading && results.length === 0 && !error"
      class="text-sm text-muted-foreground text-center py-16"
    >
      {{ RESULTS_EMPTY_PREFIX }} "{{ term }}."
    </p>
    <p
      v-if="!searched && !loading"
      class="text-sm text-muted-foreground text-center py-16 leading-relaxed"
    >
      {{ RESULTS_PROMPT }}
      <br />
      <span class="text-[0.75rem] opacity-80">
        {{ RESULTS_PROMPT_HINT }}
      </span>
    </p>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <ParkCard
        v-if="!loading"
        v-for="result in pageResults"
        :result
        :category="category"
        :key="result.id"
      />
    </div>

    <Pagination
      v-if="!loading && results.length > RESULTS_PER_PAGE"
      v-model:page="page"
      :total-pages="totalPages"
    />
  </div>
</template>
