<script setup lang="ts">
import { computed } from "vue";
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

function goPrev() {
  if (!canPrev.value) return;
  emit("update:page", props.page - 1);
}

function goNext() {
  if (!canNext.value) return;
  emit("update:page", props.page + 1);
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
