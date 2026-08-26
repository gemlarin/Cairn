<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import missingImage from "@/assets/missing.png";
import { useResultDetails } from "@/composables/useResultDetails";
import type { AvailableSearchCategories, NpsResult } from "@/types/nps";
import { useVisitsStore } from "@/stores/visits";
import { pickCardImage } from "@/helpers";

const visitsStore = useVisitsStore();
const props = defineProps<{
  result: NpsResult;
  category: AvailableSearchCategories;
}>();

const router = useRouter();
const image = computed(() => pickCardImage(props.result.images));
const imageSrc = computed(() => image.value?.url || missingImage);
const mediaFailed = ref(false);
const displaySrc = computed(() =>
  mediaFailed.value ? missingImage : imageSrc.value,
);
const details = useResultDetails(
  () => props.result,
  () => props.category,
);
const id = computed(() => props.result.id || props.result.parkCode);
const hasVisited = computed(() => visitsStore.isVisited(id.value!));

watch(imageSrc, () => {
  mediaFailed.value = false;
});

function onImageError() {
  mediaFailed.value = true;
}

function openDetail() {
  if (!id.value) return;
  router.push({
    name: "detail",
    params: {
      category: props.category,
      id: id.value,
    },
  });
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDetail();
  }
}
</script>

<template>
  <div
    role="link"
    tabindex="0"
    :aria-label="details.title"
    class="group w-full cursor-pointer text-left border border-border hover:border-foreground/40 transition-colors bg-card"
    @click="openDetail"
    @keydown="onKeydown"
  >
    <div class="park-card-media-wrap">
      <div class="park-card-media bg-muted">
        <img
          :src="displaySrc"
          :alt="details.title"
          class="park-card-media__img"
          @error="onImageError"
        />
      </div>
      <svg
        v-if="hasVisited"
        class="park-card-media__badge text-white"
        xmlns="http://www.w3.org/2000/svg"
        height="25"
        width="25"
        viewBox="0 -960 960 960"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M480-33.86 183.48-256.25q-14.28-10.57-22.23-26.62-7.95-16.04-7.95-34.13v-496.01q0-30.83 22.38-53.29 22.38-22.47 53.38-22.47h501.88q31.06 0 53.49 22.47 22.43 22.46 22.43 53.29V-317q0 18.09-7.99 34.13-7.99 16.05-22.35 26.62L480-33.86Zm0-94.73 250.94-191.49v-492.93H229.06v492.92L480-128.59Zm-42-231.09 228.15-227.91L616.43-637l-179.1 179.25-94.24-94.24-49.24 49.06L438-359.68Zm42-453.33H229.06h501.88H480Z"
        />
      </svg>
    </div>
    <div class="px-4 py-3.5">
      <p
        class="text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1 font-sans"
      >
        {{ details.label }}&ensp;·&ensp;{{ details.states }}
      </p>
      <h3 class="font-serif text-[1.05rem] text-foreground leading-snug">
        {{ details.title }}
      </h3>
    </div>
  </div>
</template>

<style scoped>
.park-card-media-wrap {
  position: relative;
}

.park-card-media {
  display: grid;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.park-card-media__img {
  grid-area: 1 / 1;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: center center !important;
  transition: transform 500ms ease-out;
}

.group:hover .park-card-media__img {
  transform: scale(1.03);
}

/* Outside overflow:hidden so drop-shadow is not clipped */
.park-card-media__badge {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  z-index: 1;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.85))
    drop-shadow(0 2px 6px rgb(0 0 0 / 0.45));
}
</style>
