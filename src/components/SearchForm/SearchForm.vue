<script setup lang="ts">
import { ref } from "vue";
import {
  type AvailableSearchCategories,
  DEFAULT_SEARCH_CATEGORY,
  DEFAULT_LIMIT,
  SEARCH_INPUT_LABEL,
} from "@/types/nps";
import searchIcon from "@/assets/search.svg";
import CategoryPopover from "@/components/CategoryPopover/CategoryPopover.vue";
const query = ref("");
const limit = ref(DEFAULT_LIMIT);
const category = ref<AvailableSearchCategories>(DEFAULT_SEARCH_CATEGORY);
const searchInputId = "cairn-search-query";
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
  <div class="w-full flex flex-col items-start md:items-center">
    <div class="w-full max-w-[472px] flex flex-col">
      <form @submit.prevent="onSearch" class="mt-8 flex w-full">
        <div class="relative flex-1 max-w-[400px]">
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
            :placeholder="SEARCH_INPUT_LABEL"
            class="w-full border border-r-0 border-border bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-foreground transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="!query"
          class="border border-border border-l-0 px-5 min-w-[72px] bg-primary text-primary-foreground text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 cursor-pointer"
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
            class="uppercase text-[0.7rem] tracking-wider font-bold text-muted-foreground"
            >Limit:</label
          >
          <input
            type="number"
            class="ml-1 text-[0.7rem] uppercase pl-1 w-10 border border-transparent text-accent font-bold bg-transparent placeholder:text-muted-foreground focus-visible:border-foreground transition-colors"
            id="limit"
            name="limit"
            min="1"
            max="50"
            v-model="limit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
