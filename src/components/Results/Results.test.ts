import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import Results from "./Results.vue";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  RESULTS_PER_PAGE,
  RESULTS_PROMPT,
  RESULTS_PROMPT_HINT,
  RESULTS_EMPTY_PREFIX,
  RESULTS_FOR_LABEL,
  RESULTS_LOADING,
  type NpsResult,
} from "@/types/nps";

function mountResults(
  props: Partial<{
    error: string;
    loading: boolean;
    results: NpsResult[];
    searched: boolean;
    term: string;
    category: (typeof AVAILABLE_SEARCH_CATEGORIES)[keyof typeof AVAILABLE_SEARCH_CATEGORIES];
  }> = {},
) {
  setActivePinia(createPinia());
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

  return mount(Results, {
    props: {
      error: "",
      loading: false,
      results: [],
      searched: false,
      term: "",
      category: AVAILABLE_SEARCH_CATEGORIES.PARKS,
      ...props,
    },
    global: {
      plugins: [createPinia(), router],
      stubs: { ParkCard: true, Pagination: true },
    },
  });
}

describe("Results", () => {
  it("shows the empty prompt before a search", () => {
    const wrapper = mountResults();
    expect(wrapper.text()).toContain(RESULTS_PROMPT);
    expect(wrapper.text()).toContain(RESULTS_PROMPT_HINT);
  });

  it("shows a no-results message after an empty search", () => {
    const wrapper = mountResults({
      searched: true,
      term: "xyzzy",
      results: [],
    });
    expect(wrapper.text()).toContain(RESULTS_EMPTY_PREFIX);
    expect(wrapper.text()).toContain("xyzzy");
  });

  it("shows an error message", () => {
    const wrapper = mountResults({
      searched: true,
      error: "Boom",
    });
    expect(wrapper.get("#error").text()).toBe("Boom");
  });

  it("renders result cards and the count label", () => {
    const results = [
      { id: "1", fullName: "Park One" },
      { id: "2", fullName: "Park Two" },
    ];
    const wrapper = mountResults({
      searched: true,
      term: "park",
      results,
    });
    expect(wrapper.text()).toContain(`2 ${RESULTS_FOR_LABEL}`);
    expect(wrapper.findAllComponents({ name: "ParkCard" }).length).toBe(2);
  });

  it("paginates when results exceed RESULTS_PER_PAGE", () => {
    const results = Array.from({ length: RESULTS_PER_PAGE + 3 }, (_, i) => ({
      id: String(i),
      fullName: `Park ${i}`,
    }));
    const wrapper = mountResults({
      searched: true,
      term: "park",
      results,
    });
    expect(wrapper.findAllComponents({ name: "ParkCard" }).length).toBe(
      RESULTS_PER_PAGE,
    );
    expect(wrapper.findComponent({ name: "Pagination" }).exists()).toBe(true);
  });

  it("announces loading in a live region", () => {
    const wrapper = mountResults({ loading: true, searched: true });
    const region = wrapper.get("#results-area");
    expect(region.attributes("aria-busy")).toBe("true");
    expect(region.attributes("aria-live")).toBe("polite");
    expect(wrapper.text()).toContain(RESULTS_LOADING);
  });
});
