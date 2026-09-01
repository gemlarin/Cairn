<script setup lang="ts">
import AuthModal from "@/components/AuthModal/AuthModal.vue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import missingImage from "@/assets/missing.png";
import { useSearchStore } from "@/stores/search";
import { useVisitsStore } from "@/stores/visits";
import Details from "@/components/Details/Details.vue";
import {
  APP_TITLE,
  type AvailableSearchCategories,
  type NpsResult,
} from "@/types/nps";
import { pickCardImage } from "@/helpers";
import { useAuthStore } from "@/stores/auth";
import { getById, resolveNpsItem } from "@/api/nps";

const authStore = useAuthStore();
const props = defineProps<{
  category: AvailableSearchCategories;
  id: string;
}>();

const { closeSignInModal } = authStore;

const router = useRouter();
const searchStore = useSearchStore();
const visitsStore = useVisitsStore();

const fetched = ref<NpsResult | null>(null);
const loadingItem = ref(false);

const result = computed(() => {
  return (
    searchStore.findById(props.id) ||
    visitsStore.visitedItems.find((item) => item.id === props.id)?.result ||
    fetched.value ||
    undefined
  );
});

watch(
  () => [props.id, props.category] as const,
  async ([id, category]) => {
    fetched.value = null;
    if (searchStore.findById(id)) return;
    const fromLog = visitsStore.visitedItems.find((item) => item.id === id);
    if (fromLog?.result) {
      searchStore.cacheResults([fromLog.result]);
      return;
    }

    loadingItem.value = true;
    try {
      const direct = await getById(category, id);
      if (direct) {
        fetched.value = direct;
        searchStore.cacheResults([direct]);
        return;
      }
      const resolved = await resolveNpsItem(id, category);
      if (resolved) {
        fetched.value = resolved.result;
        searchStore.cacheResults([resolved.result]);
      }
    } finally {
      loadingItem.value = false;
    }
  },
  { immediate: true },
);

const image = computed(() => pickCardImage(result.value?.images));
const imageSrc = computed(() => image.value?.url || missingImage);
const title = computed(
  () =>
    result.value?.fullName ||
    result.value?.title ||
    result.value?.name ||
    (loadingItem.value ? "Loading…" : "Unknown"),
);

watch(
  title,
  (next) => {
    document.title =
      next && next !== "Loading…" && next !== "Unknown"
        ? `${next} — ${APP_TITLE}`
        : APP_TITLE;
  },
  { immediate: true },
);
const mediaFailed = ref(false);
const displaySrc = computed(() =>
  mediaFailed.value ? missingImage : imageSrc.value,
);

watch(imageSrc, () => {
  mediaFailed.value = false;
});

function onImageError() {
  mediaFailed.value = true;
}

function goBack() {
  router.push({ name: "search" });
}
</script>

<template>
  <AuthModal v-if="authStore.isOpenSignInModal" @close="closeSignInModal" />
  <div class="min-h-screen bg-background font-sans lg:flex">
    <!-- Left column: photo, sticky on desktop -->
    <div
      class="relative bg-muted overflow-hidden shrink-0h-[56vw] max-h-120 min-h-55 lg:sticky lg:top-0 lg:w-1/2 lg:h-screen lg:max-h-none lg:min-h-0"
    >
      <img
        :src="displaySrc"
        :alt="title"
        class="absolute inset-0 size-full max-w-none object-cover"
        @error="onImageError"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/40"
      />

      <button
        type="button"
        class="absolute top-5 left-5 flex items-center gap-2 cursor-pointer text-white text-[10px] uppercase tracking-widest bg-black/50 hover:bg-black/60 transition-colors px-3.5 py-2.5 min-h-[40px]"
        @click="goBack"
      >
        ← Back to search
      </button>
    </div>
    <!-- Right column: content  -->
    <Details :category="category" :id="id" />
  </div>
</template>
