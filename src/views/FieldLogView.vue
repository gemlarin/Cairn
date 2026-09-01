<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/Header/Header.vue";
import Pagination from "@/components/Pagination/Pagination.vue";
import { storeToRefs } from "pinia";
import { useVisitsStore, type VisitedItem } from "@/stores/visits";
import { pickCardImage } from "@/helpers";
import { getResultDetails } from "@/composables/useResultDetails";
import {
  RESULTS_PER_PAGE,
  FIELD_LOG_LOADING,
  FIELD_LOG_EMPTY_TITLE,
  FIELD_LOG_EMPTY_MESSAGE,
  FIELD_LOG_SEARCH_PARKS,
  FIELD_LOG_PLACE_SINGULAR,
  FIELD_LOG_PLACE_PLURAL,
  FIELD_LOG_VISITED_SUFFIX,
  FIELD_LOG_NO_NOTES,
} from "@/types/nps";
import missingImage from "@/assets/missing.png";

const visitsStore = useVisitsStore();
const router = useRouter();
const { visitedItems, detailsLoading, fetchError, loading } =
  storeToRefs(visitsStore);

const page = ref(1);

onMounted(async () => {
  try {
    await visitsStore.loadFromSupabase();
    await visitsStore.loadVisitedDetails();
  } catch {
    // fetchError set in the store
  }
});

/** Full-page spinner only when there is nothing to show yet. */
const showInitialLoading = computed(
  () =>
    (loading.value || detailsLoading.value) &&
    visitedItems.value.length === 0 &&
    !fetchError.value,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(visitedItems.value.length / RESULTS_PER_PAGE)),
);

const pageItems = computed(() => {
  const start = (page.value - 1) * RESULTS_PER_PAGE;
  return visitedItems.value.slice(start, start + RESULTS_PER_PAGE);
});

watch(visitedItems, () => {
  page.value = 1;
});

function itemDetails(item: VisitedItem) {
  return getResultDetails(item.result ?? undefined, item.category);
}

function itemTitle(item: VisitedItem) {
  return itemDetails(item).title || item.id;
}

function itemLocation(item: VisitedItem) {
  const details = itemDetails(item);
  return [details.label, details.states].filter(Boolean).join(" · ");
}

function itemImageSrc(item: VisitedItem) {
  return pickCardImage(item.result?.images)?.url || missingImage;
}

function itemImageAlt(item: VisitedItem) {
  return pickCardImage(item.result?.images)?.altText || itemTitle(item);
}

function formatSavedOn(savedOn: number | null) {
  if (!savedOn) return null;
  return new Date(savedOn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function onParkSelect(item: VisitedItem) {
  if (!item.category) return;
  router.push({
    name: "detail",
    params: { category: item.category, id: item.id },
  });
}

function onBack() {
  router.push({ name: "search" });
}

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src !== missingImage) img.src = missingImage;
}
</script>

<template>
  <div>
    <Header />

    <div class="p-5 py-10 pb-24">
      <div
        v-if="showInitialLoading"
        class="flex items-center justify-center gap-2"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p class="text-sm text-muted-foreground text-center py-20">
          {{ FIELD_LOG_LOADING }}
        </p>
        <div
          class="w-8 h-8 border-4 border-ring border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      </div>

      <p
        v-else-if="fetchError && visitedItems.length === 0"
        role="alert"
        class="text-sm text-accent text-center py-10"
      >
        {{ fetchError }}
      </p>

      <div
        v-else-if="!loading && !detailsLoading && visitedItems.length === 0"
        class="text-center py-24"
      >
        <p class="font-serif text-2xl text-foreground mb-3 leading-snug">
          {{ FIELD_LOG_EMPTY_TITLE }}
        </p>
        <p class="text-sm text-muted-foreground mb-8">
          {{ FIELD_LOG_EMPTY_MESSAGE }}
        </p>
        <button
          type="button"
          class="text-xs text-foreground underline underline-offset-2 hover:text-primary transition-colors"
          @click="onBack"
        >
          {{ FIELD_LOG_SEARCH_PARKS }}
        </button>
      </div>

      <template v-else-if="visitedItems.length > 0">
        <div
          v-if="detailsLoading"
          class="flex items-center gap-2 mb-6"
          role="status"
          aria-live="polite"
        >
          <div
            class="w-4 h-4 border-2 border-ring border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <p class="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {{ FIELD_LOG_LOADING }}
          </p>
        </div>

        <p
          v-if="fetchError"
          role="alert"
          class="text-sm text-accent mb-4"
        >
          {{ fetchError }}
        </p>

        <p
          class="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-8"
        >
          {{ visitedItems.length }}
          {{
            visitedItems.length !== 1
              ? FIELD_LOG_PLACE_PLURAL
              : FIELD_LOG_PLACE_SINGULAR
          }}
          {{ FIELD_LOG_VISITED_SUFFIX }}
        </p>

        <div>
          <button
            v-for="item in pageItems"
            :key="item.id"
            type="button"
            class="w-full text-left border-t border-border py-7 group cursor-pointer"
            @click="onParkSelect(item)"
          >
            <div class="flex gap-5 items-start">
              <div
                class="shrink-0 w-[72px] h-[72px] sm:w-24 sm:h-24 bg-muted overflow-hidden"
              >
                <img
                  :src="itemImageSrc(item)"
                  :alt="itemImageAlt(item)"
                  class="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                  @error="onImageError"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3 mb-1.5">
                  <p
                    class="text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {{ itemLocation(item) }}
                  </p>
                  <p
                    v-if="formatSavedOn(item.savedOn)"
                    class="text-[11px] uppercase tracking-[0.12em] text-muted-foreground shrink-0"
                  >
                    {{ formatSavedOn(item.savedOn) }}
                  </p>
                </div>

                <h2
                  class="font-serif text-lg sm:text-xl text-foreground mb-3 leading-snug group-hover:opacity-70 transition-opacity"
                >
                  {{ itemTitle(item) }}
                </h2>

                <p
                  v-if="item.note"
                  class="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3"
                >
                  {{ item.note }}
                </p>
                <p
                  v-else
                  class="text-xs text-muted-foreground/70 italic font-sans"
                >
                  {{ FIELD_LOG_NO_NOTES }}
                </p>
              </div>
            </div>
          </button>
          <div class="border-t border-border" />
        </div>

        <Pagination
          v-if="visitedItems.length > RESULTS_PER_PAGE"
          v-model:page="page"
          :total-pages="totalPages"
        />
      </template>
    </div>
  </div>
</template>
