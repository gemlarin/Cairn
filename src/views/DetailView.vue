<script setup lang="ts">
import AuthModal from "@/components/AuthModal/AuthModal.vue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import missingImage from "@/assets/missing.png";
import { useSearchStore } from "@/stores/search";
import Details from "@/components/Details/Details.vue";
import type { AvailableSearchCategories } from "@/types/nps";
import { pickCardImage } from "@/helpers";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const props = defineProps<{
  category: AvailableSearchCategories;
  id: string;
}>();

const { closeSignInModal } = authStore;

const router = useRouter();
const searchStore = useSearchStore();

const result = computed(() => searchStore.findById(props.id));
const image = computed(() => pickCardImage(result.value?.images));
const imageSrc = computed(() => image.value?.url || missingImage);
const title = computed(
  () =>
    result.value?.fullName ||
    result.value?.title ||
    result.value?.name ||
    "Unknown",
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
