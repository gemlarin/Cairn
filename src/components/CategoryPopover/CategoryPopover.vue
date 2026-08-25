<script setup lang="ts">
import { ref, computed } from "vue";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  type AvailableSearchCategories,
} from "@/types/nps";

const props = defineProps<{
  defaultCategory: AvailableSearchCategories;
}>();

const emit = defineEmits(["category-change"]);
const selectedCategory = ref<AvailableSearchCategories>(props.defaultCategory);
const categories = [
  {
    id: AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS,
    label: "Campgrounds",
    value: AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS,
  },
  {
    id: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    label: "Parks",
    value: AVAILABLE_SEARCH_CATEGORIES.PARKS,
  },
  {
    id: AVAILABLE_SEARCH_CATEGORIES.PEOPLE,
    label: "People",
    value: AVAILABLE_SEARCH_CATEGORIES.PEOPLE,
  },
  {
    id: AVAILABLE_SEARCH_CATEGORIES.PLACES,
    label: "Places",
    value: AVAILABLE_SEARCH_CATEGORIES.PLACES,
  },
  {
    id: AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO,
    label: "Things to Do",
    value: AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO,
  },
  {
    id: AVAILABLE_SEARCH_CATEGORIES.TOURS,
    label: "Tours",
    value: AVAILABLE_SEARCH_CATEGORIES.TOURS,
  },
];

function onCategoryChange() {
  emit("category-change", selectedCategory.value);
}

const selectedCategoryLabel = computed(() => {
  return categories.find(
    (category) => category.value === selectedCategory.value,
  )?.label;
});
</script>
<template>
  <!-- 1. The Anchor Trigger Button -->
  <button
    id="category-btn"
    popovertarget="popover-content"
    class="uppercase category-popover-button flex font-bold items-center text-muted-foreground cursor-pointer gap-x-0.5 pt-2 text-[0.7rem] tracking-wider group hover:text-accent transition"
  >
    Category
    <svg
      xmlns="http://w3.org"
      height="20px"
      viewBox="0 -960 960 960"
      width="16px"
      fill="#7b6e60"
      class="group-hover:fill-accent transition-colors relative right-0.5"
    >
      <path
        d="M480-346.85 253.85-573 291-610.15l189 189 189-189L706.15-573 480-346.85Z"
      />
    </svg>
    | <span class="text-accent pl-1">{{ selectedCategoryLabel }}</span>
  </button>

  <!-- 2. Smart Popover Content Card Container -->
  <!-- Added backdrop styling using Tailwind's 'backdrop:bg-black/20' utility -->
  <div
    id="popover-content"
    popover
    class="category-popover-panel w-60 rounded-xl bg-white p-6 shadow-2xl border border-gray-100 overflow-visible backdrop:bg-black/20 backdrop:backdrop-blur-[1px]"
  >
    <!-- 3. Close Icon Button (X) -->
    <!-- 'popovertargetaction="hide"' instructs the browser to close this specific popover natively -->
    <button
      popovertarget="popover-content"
      popovertargetaction="hide"
      class="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md hover:bg-gray-100"
      aria-label="Close popover"
    >
      <svg
        xmlns="http://w3.org"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- 4. Upward Triangle Caret Arrow -->
    <div
      class="category-popover-caret absolute bottom-full w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-white"
    ></div>

    <!-- Content Core Elements -->
    <h3 class="font-medium text-[1.1rem] text-gray-900 pr-6 mb-0.5 font-serif">
      Category Options
    </h3>
    <p class="mb-4 text-[0.625rem] leading-4">
      Select the category that you want to search for.
    </p>
    <fieldset>
      <legend class="sr-only mb-2">
        Select the category that you want to search for.
      </legend>
      <div class="space-y-2">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center mb-2"
        >
          <input
            :id="category.id"
            v-model="selectedCategory"
            type="radio"
            name="theme-color"
            :value="category.value"
            @change="onCategoryChange()"
          />
          <label
            :for="category.id"
            class="ml-2 text-[0.6875rem] font-medium font-sans"
            >{{ category.label }}</label
          >
        </div>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.category-popover-button {
  anchor-name: --category-btn;
}

.category-popover-panel {
  inset: auto;
  margin: 0;
  margin-top: 0.5rem;
  position: fixed;
  position-anchor: --category-btn;
  top: anchor(bottom);
  left: anchor(left);
}

.category-popover-caret {
  left: 1.25rem;
}
</style>
