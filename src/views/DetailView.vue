<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import missingImage from "@/assets/missing.png";
import { useSearchStore } from "@/stores/search";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  DEFAULT_NATIONAL_PARK_LABEL,
  DEFAULT_TOUR_LABEL,
  DEFAULT_HISTORIC_PERSON_LABEL,
  DEFAULT_NOT_APPLICABLE_LABEL,
  DEFAULT_CAMPGROUND_LABEL,
  DEFAULT_UNLISTED_PHONE_LABEL,
  DEFAULT_UNLISTED_ADDRESS_LABEL,
  DEFAULT_UNKNOWN_LABEL,
  type AvailableSearchCategories,
  type NpsAddress,
  type NpsPhoneNumber,
} from "@/types/nps";
import { formatAddress, formatPhoneNumber, truncate } from "@/helpers";

const props = defineProps<{
  category: AvailableSearchCategories;
  id: string;
}>();

const router = useRouter();
const searchStore = useSearchStore();

const result = computed(() => searchStore.findById(props.id));

const title = computed(
  () =>
    result.value?.fullName ||
    result.value?.title ||
    result.value?.name ||
    "Unknown",
);

const image = computed(() => result.value?.images?.[0]);
const imageSrc = computed(() => image.value?.url || missingImage);

const details = computed(() => {
  const item = result.value;
  if (!item) {
    return {
      label: DEFAULT_UNKNOWN_LABEL,
      states: DEFAULT_NOT_APPLICABLE_LABEL,
      title: DEFAULT_UNKNOWN_LABEL,
    };
  }

  if (props.category === AVAILABLE_SEARCH_CATEGORIES.PARKS) {
    return {
      label: truncate(item.designation, 40) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: item.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.fullName,
    };
  } else if (props.category === AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
    };
  } else if (props.category === AVAILABLE_SEARCH_CATEGORIES.TOURS) {
    const tour = item.park;
    return {
      label: truncate(tour?.fullName || tour?.name, 40) ?? DEFAULT_TOUR_LABEL,
      states: tour?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
    };
  } else if (props.category === AVAILABLE_SEARCH_CATEGORIES.PEOPLE) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_HISTORIC_PERSON_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
    };
  } else if (props.category === AVAILABLE_SEARCH_CATEGORIES.PLACES) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(
          related?.fullName || related?.name || related?.designation,
          40,
        ) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
    };
  } else if (props.category === AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS) {
    const physicalAddress = item.addresses?.find(
      (address: NpsAddress) => address.type?.toLowerCase() === "physical",
    );
    const phone = item.contacts?.phoneNumbers?.find(
      (contact: NpsPhoneNumber) => contact.type?.toLowerCase() === "voice",
    );
    return {
      label:
        formatPhoneNumber(phone?.phoneNumber) ?? DEFAULT_UNLISTED_PHONE_LABEL,
      states: formatAddress(physicalAddress) ?? DEFAULT_UNLISTED_ADDRESS_LABEL,
      title: item.name || DEFAULT_CAMPGROUND_LABEL,
    };
  } else {
    return {
      label: DEFAULT_UNKNOWN_LABEL,
      title: DEFAULT_UNKNOWN_LABEL,
    };
  }
});

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src !== missingImage) {
    img.src = missingImage;
  }
}

function goBack() {
  router.push({ name: "search" });
}
</script>

<template>
  <div class="min-h-screen bg-background font-sans lg:flex">
    <!-- Left column: photo, sticky on desktop -->
    <div
      class="relative bg-muted overflow-hidden shrink-0h-[56vw] max-h-120 min-h-55 lg:sticky lg:top-0 lg:w-1/2 lg:h-screen lg:max-h-none lg:min-h-0"
    >
      <img
        :src="imageSrc"
        :alt="title"
        class="absolute inset-0 size-full max-w-none object-cover"
        @error="onImageError"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/40"
      />

      <button
        @click="goBack"
        className="absolute top-5 left-5 flex items-center gap-2 cursor-pointer text-white text-[10px] uppercase tracking-widest bg-black/50 hover:bg-black/60 transition-colors px-3.5 py-2.5 min-h-[40px]"
      >
        ← Back to search
      </button>
    </div>
    <!-- Right column: content  -->
    <div
      className="lg:flex-1 px-6 sm:px-10 lg:px-14 py-10 lg:py-16 lg:min-h-screen"
    >
      <div className="max-w-md">
        <p
          className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-2.5"
        >
          {{ details.label }}&ensp;·&ensp;{{ details.states }}
        </p>
        <h1
          className="font-serif text-2xl sm:text-[2.4rem] text-foreground leading-[1.1] mb-10"
        >
          {{ details.title }}
        </h1>
      </div>
    </div>
  </div>

  <!-- <div class="mt-8 pb-20 max-w-3xl"> 
    <button
      type="button"
      class="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors cursor-pointer mb-6"
      @click="goBack"
    >
      ← Back to search
    </button>

    <template v-if="result">
      <div class="relative overflow-hidden bg-muted aspect-[16/9] mb-6">
        <img
          :src="imageSrc"
          :alt="title"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
      </div>
      <p
        class="text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-2 font-sans"
      >
        {{ category }}
        <span v-if="result.states">&ensp;·&ensp;{{ result.states }}</span>
      </p>
      <h2 class="font-serif text-3xl text-foreground leading-tight mb-4">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="text-sm text-foreground/80 leading-relaxed whitespace-pre-line"
      >
        {{ description }}
      </p>
      <p v-else class="text-sm text-muted-foreground">
        No description available for this listing.
      </p>
    </template>

    <template v-else>
      <h2 class="font-serif text-2xl text-foreground mb-3">Result not found</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Search again, then open a card. Detail pages use the latest search
        results (we'll add a direct NPS lookup later).
      </p>
    </template>
  </div> -->
</template>
