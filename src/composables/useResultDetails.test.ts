import { describe, it, expect } from "vitest";
import { getResultDetails } from "./useResultDetails";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";

const park = {
  designation: "National Park",
  states: "CO",
  fullName: "Rocky Mountain National Park",
};

const historicPerson = {
  relatedParks: [
    {
      fullName: "Robert Frost",
      states: "CO",
    },
  ],
  title: "Robert Frost was a poet.",
};

const campground = {
  designation: "Campground",
  addresses: [
    {
      type: "physical",
      line1: "123 Main St",
      city: "Denver",
      stateCode: "CO",
      postalCode: "80201",
    },
  ],
  contacts: {
    phoneNumbers: [
      {
        phoneNumber: "123-456-7890",
        type: "Voice" as const,
      },
    ],
    emailAddresses: [
      {
        emailAddress: "john.doe@example.com",
      },
    ],
  },
  name: "Campground Name",
};

const place = {
  designation: "Place",
  relatedParks: [park],
  title: "National Park Place",
};

const thingToDo = {
  label: "Thing to Do Name",
  relatedParks: [park],
  title: "National Park Hiking Trail",
};
describe("getResultDetails", () => {
  it("should return the correct result details for a park with a long designation", () => {
    const result = getResultDetails(park, AVAILABLE_SEARCH_CATEGORIES.PARKS);
    expect(result.label).toBe("National Park");
    expect(result.states).toBe("CO");
    expect(result.title).toBe("Rocky Mountain National Park");
  });
  it("should return the correct result details for a historic person", () => {
    const result = getResultDetails(
      historicPerson,
      AVAILABLE_SEARCH_CATEGORIES.PEOPLE,
    );
    expect(result.label).toBe("Robert Frost");
    expect(result.states).toBe("CO");
    expect(result.title).toBe("Robert Frost was a poet.");
  });
  it("should return the correct result details for a campground", () => {
    const result = getResultDetails(
      campground,
      AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS,
    );
    expect(result.label).toBe("(123) 456-7890");
    expect(result.states).toBe("123 Main St, Denver, CO 80201");
    expect(result.title).toBe("Campground Name");
  });
  it("should return the correct result details for a place", () => {
    const result = getResultDetails(place, AVAILABLE_SEARCH_CATEGORIES.PLACES);
    expect(result.label).toBe("Rocky Mountain National Park");
    expect(result.states).toBe("CO");
    expect(result.title).toBe("National Park Place");
  });
  it("should return the correct result details for a thing to do", () => {
    const result = getResultDetails(
      thingToDo,
      AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO,
    );
    expect(result.label).toBe("Rocky Mountain National Park");
    expect(result.states).toBe("CO");
    expect(result.title).toBe("National Park Hiking Trail");
  });
});
