import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { formatAddress, formatPhoneNumber, truncate } from "@/helpers";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  DEFAULT_CAMPGROUND_LABEL,
  DEFAULT_HISTORIC_PERSON_LABEL,
  DEFAULT_NATIONAL_PARK_LABEL,
  DEFAULT_NOT_APPLICABLE_LABEL,
  DEFAULT_TOUR_LABEL,
  DEFAULT_UNKNOWN_LABEL,
  DEFAULT_UNLISTED_ADDRESS_LABEL,
  DEFAULT_UNLISTED_PHONE_LABEL,
  type AvailableSearchCategories,
  type NpsResult,
} from "@/types/nps";

export type ResultDetails = {
  label: string;
  states?: string;
  title?: string;
  description?: string;
  url?: string;
};

export function getResultDetails(
  item: NpsResult | undefined,
  category: AvailableSearchCategories,
): ResultDetails {
  if (!item) {
    return {
      label: DEFAULT_UNKNOWN_LABEL,
      states: DEFAULT_NOT_APPLICABLE_LABEL,
      title: DEFAULT_UNKNOWN_LABEL,
      description: DEFAULT_UNKNOWN_LABEL,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.PARKS) {
    return {
      label: truncate(item.designation, 40) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: item.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.fullName,
      description: item?.description,
      url: item.url,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
      description: item?.shortDescription,
      url: item.url,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.TOURS) {
    const tour = item.park;
    return {
      label: truncate(tour?.fullName || tour?.name, 40) ?? DEFAULT_TOUR_LABEL,
      states: tour?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
      description: item?.description,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.PEOPLE) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(related?.fullName || related?.name, 40) ??
        DEFAULT_HISTORIC_PERSON_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
      description: item?.listingDescription,
      url: item.url,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.PLACES) {
    const related = item.relatedParks?.[0];
    return {
      label:
        truncate(
          related?.fullName || related?.name || related?.designation,
          40,
        ) ?? DEFAULT_NATIONAL_PARK_LABEL,
      states: related?.states || DEFAULT_NOT_APPLICABLE_LABEL,
      title: item.title,
      description: item?.listingDescription,
      url: item.url,
    };
  }

  if (category === AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS) {
    const physicalAddress = item.addresses?.find(
      (address) => address.type?.toLowerCase() === "physical",
    );
    const phone = item.contacts?.phoneNumbers?.find(
      (contact) => contact.type?.toLowerCase() === "voice",
    );
    return {
      label:
        formatPhoneNumber(phone?.phoneNumber) ?? DEFAULT_UNLISTED_PHONE_LABEL,
      states: formatAddress(physicalAddress) ?? DEFAULT_UNLISTED_ADDRESS_LABEL,
      title: item.name || DEFAULT_CAMPGROUND_LABEL,
      description: item?.description,
      url: item.url,
    };
  }

  return {
    label: DEFAULT_UNKNOWN_LABEL,
    title: DEFAULT_UNKNOWN_LABEL,
    description: DEFAULT_UNKNOWN_LABEL,
  };
}

/** Reactive wrapper for use in components. */
export function useResultDetails(
  result: MaybeRefOrGetter<NpsResult | undefined>,
  category: MaybeRefOrGetter<AvailableSearchCategories>,
) {
  return computed(() => getResultDetails(toValue(result), toValue(category)));
}
