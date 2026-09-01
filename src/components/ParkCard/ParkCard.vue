<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import missingImage from "@/assets/missing.png";
import { useResultDetails } from "@/composables/useResultDetails";
import {
  PARK_CARD_HAS_NOTES,
  PARK_CARD_VISITED,
  type AvailableSearchCategories,
  type NpsResult,
} from "@/types/nps";
import { useVisitsStore } from "@/stores/visits";
import { pickCardImage } from "@/helpers";

const visitsStore = useVisitsStore();
const props = defineProps<{
  result: NpsResult;
  category: AvailableSearchCategories;
}>();

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
const hasAddedNote = computed(() => visitsStore.hasAddedNote(id.value!));

const linkLabel = computed(() => {
  const parts = [details.value.title || "Untitled"];
  if (hasVisited.value) parts.push(PARK_CARD_VISITED);
  if (hasAddedNote.value) parts.push(PARK_CARD_HAS_NOTES);
  return parts.join(", ");
});

const detailTo = computed(() => ({
  name: "detail" as const,
  params: {
    category: props.category,
    id: id.value!,
  },
}));

watch(imageSrc, () => {
  mediaFailed.value = false;
});

function onImageError() {
  mediaFailed.value = true;
}
</script>

<template>
  <RouterLink
    v-if="id"
    :to="detailTo"
    :aria-label="linkLabel"
    class="group block w-full no-underline text-inherit cursor-pointer text-left border border-border hover:border-foreground/40 transition-colors bg-card"
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
      <div class="park-card-media__icons-wrap flex items-center gap-2">
        <svg
          v-if="hasVisited"
          class="park-card-media__badge text-white"
          xmlns="http://www.w3.org/2000/svg"
          height="25px"
          width="25px"
          viewBox="0 -960 960 960"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M480-33.86 183.48-256.25q-14.28-10.57-22.23-26.62-7.95-16.04-7.95-34.13v-496.01q0-30.83 22.38-53.29 22.38-22.47 53.38-22.47h501.88q31.06 0 53.49 22.47 22.43 22.46 22.43 53.29V-317q0 18.09-7.99 34.13-7.99 16.05-22.35 26.62L480-33.86Zm0-94.73 250.94-191.49v-492.93H229.06v492.92L480-128.59Zm-42-231.09 228.15-227.91L616.43-637l-179.1 179.25-94.24-94.24-49.24 49.06L438-359.68Zm42-453.33H229.06h501.88H480Z"
          />
        </svg>
        <svg
          v-if="hasAddedNote"
          class="park-card-media__badge text-white"
          xmlns="http://www.w3.org/2000/svg"
          height="25px"
          viewBox="0 -960 960 960"
          width="25px"
          fill="#FFFFFF"
          aria-hidden="true"
        >
          <path
            d="M200-200h360v-200h200v-360H200v560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v400L600-120H200Zm80-280v-80h200v80H280Zm0-160v-80h400v80H280Zm-80 360v-560 560Z"
          />
        </svg>
      </div>
    </div>
    <div class="px-4 py-3.5">
      <p
        class="text-xs sm:text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1 font-sans"
      >
        {{ details.label }}&ensp;·&ensp;{{ details.states }}
      </p>
      <h3 class="font-serif text-[1.05rem] text-foreground leading-snug">
        {{ details.title }}
      </h3>
    </div>
  </RouterLink>
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
.park-card-media__icons-wrap {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  z-index: 1;
  pointer-events: none;
}
.park-card-media__badge {
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.85))
    drop-shadow(0 2px 6px rgb(0 0 0 / 0.45));
}
</style>
