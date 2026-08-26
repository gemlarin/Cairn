export type NpsImage = {
  url: string;
  altText: string;
  title: string;
  caption: string;
  credit?: string;
  description?: string;
};

export type NpsAddress = {
  postalCode?: string;
  city?: string;
  stateCode?: string;
  countryCode?: string;
  provinceTerritoryCode?: string;
  line1?: string;
  type?: string;
  line3?: string;
};

export type NpsContact = {
  phoneNumbers?: NpsPhoneNumber[];
  emailAddresses?: NpsEmailAddress[];
};
export type NpsEmailAddress = {
  emailAddress?: string;
  description?: string;
};
export type NpsPhoneNumber = {
  phoneNumber?: string;
  description?: string;
  extension?: string;
  type?: "Voice" | "Fax" | "TTY";
};

/** Shared shape for NPS list endpoints (parks, tours, things to do, etc.). */
export type NpsResult = {
  id?: string;
  contacts?: NpsContact;
  addresses?: NpsAddress[];
  parkCode?: string;
  fullName?: string;
  name?: string;
  title?: string;
  description?: string;
  designation?: string;
  states?: string;
  url?: string;
  images?: NpsImage[];
  relatedParks?: NpsResult[];
  park?: NpsResult;
  listingDescription?: string;
  shortDescription?: string;
  bodyText?: string;
};

export type NpsListResponse<T> = {
  total: string;
  limit: string;
  start: string;
  data: T[];
};

export const AVAILABLE_SEARCH_CATEGORIES = {
  CAMPGROUNDS: "campgrounds",
  PARKS: "parks",
  PEOPLE: "people",
  PLACES: "places",
  THINGS_TO_DO: "thingstodo",
  TOURS: "tours",
} as const;

export const DEFAULT_LIMIT = 20;

export const DEFAULT_SEARCH_CATEGORY = AVAILABLE_SEARCH_CATEGORIES.PARKS;
export const DEFAULT_NATIONAL_PARK_LABEL = "National Park";
export const DEFAULT_TOUR_LABEL = "Tour";
export const DEFAULT_HISTORIC_PERSON_LABEL = "Historic Person";
export const DEFAULT_NOT_APPLICABLE_LABEL = "N/A";
export const DEFAULT_CAMPGROUND_LABEL = "Campground";
export const DEFAULT_UNLISTED_PHONE_LABEL = "Unlisted Phone";
export const DEFAULT_UNLISTED_ADDRESS_LABEL = "Unlisted Address";
export const DEFAULT_UNKNOWN_LABEL = "Unknown";

export type AvailableSearchCategories =
  (typeof AVAILABLE_SEARCH_CATEGORIES)[keyof typeof AVAILABLE_SEARCH_CATEGORIES];
