<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  type AvailableSearchCategories,
  DEFAULT_SEARCH_CATEGORY,
  DEFAULT_LIMIT,
  SEARCH_INPUT_LABEL,
  SEARCH_INPUT_LABEL_SHORT,
} from "@/types/nps";
import searchIcon from "@/assets/search.svg";
import CategoryPopover from "@/components/CategoryPopover/CategoryPopover.vue";

const query = ref("");
const limit = ref(DEFAULT_LIMIT);
const category = ref<AvailableSearchCategories>(DEFAULT_SEARCH_CATEGORY);
const searchInputId = "cairn-search-query";
/** Shorter placeholder on narrow screens so 16px text still fits. */
const narrow = ref(false);

const placeholder = ref(SEARCH_INPUT_LABEL);

let mediaQuery: MediaQueryList | null = null;

function syncNarrow(event?: MediaQueryList | MediaQueryListEvent) {
  const matches =
    event && "matches" in event
      ? event.matches
      : (mediaQuery?.matches ?? false);
  narrow.value = matches;
  placeholder.value = matches
    ? SEARCH_INPUT_LABEL_SHORT
    : SEARCH_INPUT_LABEL;
}

onMounted(() => {
  if (typeof window.matchMedia !== "function") return;
  mediaQuery = window.matchMedia("(max-width: 639px)");
  syncNarrow(mediaQuery);
  mediaQuery.addEventListener("change", syncNarrow);
});

onUnmounted(() => {
  mediaQuery?.removeEventListener("change", syncNarrow);
});

const emit = defineEmits<{
  "init-search": [
    searchTerm: string,
    limit: number,
    category: AvailableSearchCategories,
  ];
}>();

function onSearch() {
  emit("init-search", query.value, limit.value, category.value);
}

function onCategoryChange(newCategory: AvailableSearchCategories) {
  category.value = newCategory;
}
</script>

<template>
  <div class="w-full px-3 sm:px-5">
    <div class="mx-auto w-full max-w-[472px] flex flex-col">
      <form @submit.prevent="onSearch" class="mt-8 flex w-full min-w-0">
        <div class="relative min-w-0 flex-1">
          <label :for="searchInputId" class="sr-only">{{
            SEARCH_INPUT_LABEL
          }}</label>
          <img
            :src="searchIcon"
            class="absolute size-4 left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
            alt=""
            aria-hidden="true"
          />
          <input
            :id="searchInputId"
            v-model="query"
            type="search"
            name="q"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            :placeholder="placeholder"
            class="w-full border border-r-0 border-border bg-transparent pl-10 pr-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-foreground transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="!query"
          class="border border-border border-l-0 px-5 min-w-[72px] bg-primary text-primary-foreground text-xs sm:text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 cursor-pointer"
        >
          SEARCH
        </button>
      </form>
      <div class="flex justify-start w-full">
        <CategoryPopover
          @category-change="onCategoryChange"
          :default-category="category"
        />
        <div class="flex justify-start items-center ml-5 pt-2">
          <label
            for="limit"
            class="uppercase text-xs sm:text-[0.7rem] tracking-wider font-bold text-muted-foreground"
            >Limit:</label
          >
          <input
            type="number"
            class="ml-1 text-base uppercase pl-1 w-12 border border-transparent text-accent font-bold bg-transparent placeholder:text-muted-foreground focus-visible:border-foreground transition-colors"
            id="limit"
            name="limit"
            min="1"
            max="50"
            inputmode="numeric"
            v-model="limit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
