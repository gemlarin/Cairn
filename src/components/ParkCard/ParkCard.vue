<script setup lang="ts">
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
  type NpsResult,
} from "@/types/nps";
import { computed } from "vue";
import { useRouter } from "vue-router";
import missingImage from "@/assets/missing.png";
import { formatAddress, formatPhoneNumber, truncate } from "@/helpers";

const props = defineProps<{
  result: NpsResult;
  category: AvailableSearchCategories;
}>();

const router = useRouter();
const image = props.result.images?.[0];
const imageSrc = computed(() => image?.url || missingImage);
const category = props.category;

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src !== missingImage) {
    img.src = missingImage;
  }
}

function openDetail() {
  const id = props.result.id || props.result.parkCode;
  if (!id) return;
  router.push({
    name: "detail",
    params: {
      category: props.category,
      id,
    },
  });
}

const details = computed(() => {
  if (category === AVAILABLE_SEARCH_CATEGORIES.PARKS) {
    return {
      label:
        truncate(props.result.designation, 40) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: props.result.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: props.result.fullName,
    };
  } else if (category === AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO) {
    const related = props.result.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: props.result.title,
    };
  } else if (category === AVAILABLE_SEARCH_CATEGORIES.TOURS) {
    const tour = props.result.park;
    return {
      label: truncate(tour?.fullName || tour?.name, 40) ?? DEFAULT_TOUR_LABEL,
      states: tour?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: props.result.title,
    };
  } else if (category === AVAILABLE_SEARCH_CATEGORIES.PEOPLE) {
    const related = props.result.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_HISTORIC_PERSON_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: props.result.title,
    };
  } else if (category === AVAILABLE_SEARCH_CATEGORIES.PLACES) {
    const related = props.result.relatedParks?.[0];
    return {
      label:
        truncate(
          related?.fullName || related?.name || related?.designation,
          40,
        ) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: props.result.title,
    };
  } else if (category === AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS) {
    const result = props.result;
    const physicalAddress = result?.addresses?.find(
      (address) => address.type?.toLowerCase() === "physical",
    );
    const phone = result?.contacts?.phoneNumbers?.find(
      (contact) => contact.type?.toLowerCase() === "voice",
    );
    return {
      label:
        formatPhoneNumber(phone?.phoneNumber) ?? DEFAULT_UNLISTED_PHONE_LABEL,
      states: formatAddress(physicalAddress) ?? DEFAULT_UNLISTED_ADDRESS_LABEL,
      title: result?.name || DEFAULT_CAMPGROUND_LABEL,
    };
  } else {
    return {
      label: DEFAULT_UNKNOWN_LABEL,
      title: DEFAULT_UNKNOWN_LABEL,
    };
  }
});
</script>

<template>
  <button
    type="button"
    class="group w-full cursor-pointer text-left border border-border hover:border-foreground/40 transition-colors bg-card"
    @click="openDetail"
  >
    <div className="relative overflow-hidden bg-muted aspect-[4/3]">
      <img
        :src="imageSrc"
        :alt="details.title"
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        @error="onImageError"
      />
    </div>
    <div class="px-4 py-3.5">
      <p
        className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1 font-sans"
      >
        {{ details.label }}&ensp;·&ensp;{{ details.states }}
      </p>
      <h3 className="font-serif text-[1.05rem] text-foreground leading-snug">
        {{ details.title }}
      </h3>
    </div>
  </button>
</template>
