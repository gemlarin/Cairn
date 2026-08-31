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

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
} | null;

export type SignUpResult =
  | { status: "signed_in" }
  | { status: "confirm_email" };

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

export type VisitRow = {
  id: string;
  user_id: string;
  item_id: string;
  /** NPS search category — needed to re-fetch details later. */
  category: AvailableSearchCategories | null;
  visited: boolean;
  note: string | null;
  saved_on: string | null;
  updated_at: string;
};

export type VisitNote = {
  id: string;
  note: string;
  /** Timestamp of last successful save; null until first save. */
  savedOn: number | null;
};

export type VisitUpsert = {
  item_id: string;
  category?: AvailableSearchCategories | null;
  visited?: boolean;
  note?: string | null;
  saved_on?: string | null;
};

export type AvailableSearchCategories =
  (typeof AVAILABLE_SEARCH_CATEGORIES)[keyof typeof AVAILABLE_SEARCH_CATEGORIES];

export const DEFAULT_LIMIT = 20;
/** Page size for search results and Field Log lists. */
export const RESULTS_PER_PAGE = 12;
export const DEFAULT_SEARCH_CATEGORY = AVAILABLE_SEARCH_CATEGORIES.PARKS;
export const DEFAULT_NATIONAL_PARK_LABEL = "National Park";
export const DEFAULT_TOUR_LABEL = "Tour";
export const DEFAULT_HISTORIC_PERSON_LABEL = "Historic Person";
export const DEFAULT_NOT_APPLICABLE_LABEL = "N/A";
export const DEFAULT_CAMPGROUND_LABEL = "Campground";
export const DEFAULT_UNLISTED_PHONE_LABEL = "Unlisted Phone";
export const DEFAULT_UNLISTED_ADDRESS_LABEL = "Unlisted Address";
export const DEFAULT_UNKNOWN_LABEL = "Unknown";
export const DEFAULT_SIGN_IN = "Sign In";
export const DEFAULT_CREATE_ACCOUNT = "Create Account";
export const DEFAULT_NEW_HERE = "New here? ";
export const DEFAULT_ALREADY_HAVE_AN_ACCOUNT = "Already have an account? ";
export const DEFAULT_WELCOME_BACK = "Welcome back.";
export const DEFAULT_JOIN_CAIRN = "Join Cairn.";
export const DEFAULT_WELCOME_BACK_MESSAGE = "Sign in to see your logged parks.";
export const DEFAULT_JOIN_CAIRN_MESSAGE =
  "Create an account to save your visits.";
export const DEFAULT_EMAIL = "you@example.com";
export const DEFAULT_PASSWORD = "••••••••";
export const MODE_SIGN_IN = "in";
export const MODE_CREATE_ACCOUNT = "up";
export const DEFAULT_NAME = "John Muir";
export const DEFAULT_ERROR = "An error occurred. Please try again.";
export const DEFAULT_NAME_LABEL = "Name";
export const DEFAULT_EMAIL_LABEL = "Email";
export const DEFAULT_PASSWORD_LABEL = "Password";
export const DEFAULT_CONFIRM_EMAIL_TITLE = "Check your email.";
export const DEFAULT_CONFIRM_EMAIL_MESSAGE =
  "We sent a confirmation link. Confirm your email, then sign in.";
export const DEFAULT_EMAIL_NOT_CONFIRMED =
  "Confirm your email before signing in. Check your inbox for the link.";
export const DEFAULT_SAVE_ERROR = "Failed to save. Please try again.";
export const DEFAULT_FETCH_ERROR = "Failed to load data.";

export const FIELD_LOG_LOADING = "Loading your log…";
export const FIELD_LOG_EMPTY_TITLE = "No parks logged yet.";
export const FIELD_LOG_EMPTY_MESSAGE =
  "Open a park and mark it visited to begin your log.";
export const FIELD_LOG_SEARCH_PARKS = "Search parks";
export const FIELD_LOG_PLACE_SINGULAR = "place";
export const FIELD_LOG_PLACE_PLURAL = "places";
export const FIELD_LOG_VISITED_SUFFIX = "visited";
export const FIELD_LOG_NO_NOTES = "No notes written.";

export const RESULTS_FOR_LABEL = "RESULTS FOR";
export const RESULTS_EMPTY_PREFIX = "No results found for";
export const RESULTS_PROMPT =
  "Search parks, tours, and things to do across the United States.";
export const RESULTS_PROMPT_HINT = 'Try "Yosemite," "Alaska," or "canyon."';

export type Mode = typeof MODE_SIGN_IN | typeof MODE_CREATE_ACCOUNT;
