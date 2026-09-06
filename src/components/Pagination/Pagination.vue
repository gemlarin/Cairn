<script setup lang="ts">
import { computed, nextTick } from "vue";
import paginationLeft from "@/assets/pagination-left.svg";
import paginationRight from "@/assets/pagination-right.svg";

const props = defineProps<{
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:page": [page: number];
}>();

const canPrev = computed(() => props.page > 1);
const canNext = computed(() => props.page < props.totalPages);

/**
 * iOS Safari often drops `behavior: "smooth"` when the results list reflows,
 * then scrolls the still-focused pagination button back into view — so Next
 * (clicked at the bottom) fails more often than Prev. Blur + instant scroll
 * after the DOM update is reliable on iPhone.
 */
async function goToPage(next: number) {
  emit("update:page", next);
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
  await nextTick();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function goPrev() {
  if (!canPrev.value) return;
  void goToPage(props.page - 1);
}

function goNext() {
  if (!canNext.value) return;
  void goToPage(props.page + 1);
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-border"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="size-8 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
      :disabled="!canPrev"
      aria-label="Previous page"
      @click="goPrev"
    >
      <img :src="paginationLeft" alt="" class="size-5" />
    </button>

    <p
      class="text-xs sm:text-[11px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums"
      aria-current="page"
    >
      Page {{ page }} of {{ totalPages }}
    </p>

    <button
      type="button"
      class="size-8 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
      :disabled="!canNext"
      aria-label="Next page"
      @click="goNext"
    >
      <img :src="paginationRight" alt="" class="size-5" />
    </button>
  </nav>
</template>
