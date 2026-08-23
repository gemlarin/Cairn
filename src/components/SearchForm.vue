<script setup lang="ts">
import { ref } from "vue";
import searchIcon from "../assets/search.svg";

const query = ref("");
const emit = defineEmits<{
  "init-search": [searchTerm: string];
}>();

function onSearch() {
  emit("init-search", query.value);
}
</script>

<template>
  <form @submit.prevent="onSearch" class="mt-8 flex">
    <div class="relative flex-1">
      <img
        :src="searchIcon"
        class="absolute size-4 left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        alt="search"
      />
      <input
        v-model="query"
        placeholder="Search for a park name, state, or activity"
        class="w-full border border-r-0 border-border bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
      />
    </div>
    <button
      type="submit"
      :disabled="!query"
      class="border border-border border-l-0 px-5 min-w-[72px] bg-primary text-primary-foreground text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
    >
      SEARCH
    </button>
  </form>
</template>
