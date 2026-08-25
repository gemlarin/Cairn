import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import ParkCard from "./ParkCard.vue";
import { AVAILABLE_SEARCH_CATEGORIES, type NpsResult } from "@/types/nps";

function mountCard(props: {
  result: NpsResult;
  category: (typeof AVAILABLE_SEARCH_CATEGORIES)[keyof typeof AVAILABLE_SEARCH_CATEGORIES];
}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "search", component: { template: "<div />" } },
      {
        path: "/item/:category/:id",
        name: "detail",
        component: { template: "<div />" },
      },
    ],
  });

  return mount(ParkCard, {
    props,
    global: {
      plugins: [router],
    },
  });
}
const nationalPark: NpsResult = {
  designation: "National Park",
  states: "CA",
  fullName: "Yosemite National Park",
  name: "Yosemite",
  title: "Yosemite National Park",
  description: "Yosemite National Park is a national park in California.",
  id: "123",
};
const tour: NpsResult = {
  designation: "Tour",
  park: {
    designation: "National Park",
    states: "CA",
    fullName: "Tour of the Park",
    name: "Yosemite",
    id: "123",
  },
  name: "Yosemite",
  title: "Yosemite National Park Tour",
  description: "Yosemite National Park is a national park in California.",
  id: "123",
};
const campground: NpsResult = {
  designation: "Campground",
  states: "CA",
  fullName: "Yosemite National Park",
  name: "Yosemite National Park Campground",
  title: "Yosemite National Park Campground",
  description: "Yosemite National Park is a national park in California.",
  id: "123",
  contacts: {
    phoneNumbers: [
      {
        phoneNumber: "1234567890",
        type: "Voice",
      },
    ],
  },
  addresses: [
    {
      line1: "123 Main St",
      city: "Anytown",
      stateCode: "CA",
      postalCode: "12345",
      type: "Physical",
    },
  ],
};
const thingsToDo: NpsResult = {
  relatedParks: [
    {
      designation: "National Park",
      states: "CA",
      fullName: "Yosemite National Park",
      name: "Yosemite",
      id: "123",
    },
  ],
  title: "Things to Do",
  description: "Yosemite National Park is a national park in California.",
  id: "123",
};
const historicPerson: NpsResult = {
  title: "Robert Frost",
  relatedParks: [
    {
      designation: "National Park",
      states: "MO",
      fullName: "Mark Twain National Forest",
      name: "Yosemite",
    },
  ],
  id: "123",
};
const place: NpsResult = {
  title: "Assistance on the Trail",
  listingDescription: "Yosemite National Park Place is a place in California.",
  id: "123",
  relatedParks: [
    {
      designation: "National Monument",
      states: "NE",
      fullName: "Scotts Bluff National Monument",
      name: "Scotts Bluff",
    },
  ],
};
describe("ParkCard", () => {
  it("should render a national park", () => {
    const wrapper = mountCard({
      result: nationalPark,
      category: AVAILABLE_SEARCH_CATEGORIES.PARKS,
    });
    expect(wrapper.text()).toContain("Yosemite National Park");
    expect(wrapper.text()).toContain("CA");
    expect(wrapper.text()).toContain("National Park");
  });
  it("should render a tour", () => {
    const wrapper = mountCard({
      result: tour,
      category: AVAILABLE_SEARCH_CATEGORIES.TOURS,
    });
    expect(wrapper.text()).toContain("Yosemite National Park Tour");
    expect(wrapper.text()).toContain("CA");
    expect(wrapper.text()).toContain("Tour of the Park");
  });
  it("should render a campground", () => {
    const wrapper = mountCard({
      result: campground,
      category: AVAILABLE_SEARCH_CATEGORIES.CAMPGROUNDS,
    });
    expect(wrapper.text()).toContain("Yosemite National Park Campground");
    expect(wrapper.text()).toContain("(123) 456-7890");
    expect(wrapper.text()).toContain("123 Main St, Anytown, CA 12345");
  });
  it("should render a things to do", () => {
    const wrapper = mountCard({
      result: thingsToDo,
      category: AVAILABLE_SEARCH_CATEGORIES.THINGS_TO_DO,
    });
    expect(wrapper.text()).toContain("Yosemite National Park");
    expect(wrapper.text()).toContain("Things to Do");
    expect(wrapper.text()).toContain("CA");
  });
  it("should render a historic person", () => {
    const wrapper = mountCard({
      result: historicPerson,
      category: AVAILABLE_SEARCH_CATEGORIES.PEOPLE,
    });
    expect(wrapper.text()).toContain("Mark Twain National Forest");
    expect(wrapper.text()).toContain("MO");
    expect(wrapper.text()).toContain("Robert Frost");
  });
  it("should render a place", () => {
    const wrapper = mountCard({
      result: place,
      category: AVAILABLE_SEARCH_CATEGORIES.PLACES,
    });
    expect(wrapper.text()).toContain("Scotts Bluff National Monument");
    expect(wrapper.text()).toContain("NE");
    expect(wrapper.text()).toContain("Assistance on the Trail");
  });
});
