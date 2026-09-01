import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SearchForm from "./SearchForm.vue";
import {
  AVAILABLE_SEARCH_CATEGORIES,
  DEFAULT_LIMIT,
  DEFAULT_SEARCH_CATEGORY,
  SEARCH_INPUT_LABEL,
} from "@/types/nps";

describe("SearchForm", () => {
  it("disables search until a query is entered", async () => {
    const wrapper = mount(SearchForm, {
      global: { stubs: { CategoryPopover: true } },
    });
    const button = wrapper.get('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();

    await wrapper.get("input[placeholder]").setValue("Yosemite");
    expect(button.attributes("disabled")).toBeUndefined();
  });

  it("emits init-search with query, limit, and category", async () => {
    const wrapper = mount(SearchForm, {
      global: { stubs: { CategoryPopover: true } },
    });
    await wrapper.get("input[placeholder]").setValue("Alaska");
    await wrapper.get('input[type="number"]').setValue(10);
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("init-search")?.[0]).toEqual([
      "Alaska",
      10,
      DEFAULT_SEARCH_CATEGORY,
    ]);
  });

  it("updates category from CategoryPopover and includes it on search", async () => {
    const wrapper = mount(SearchForm, {
      global: {
        stubs: {
          CategoryPopover: {
            name: "CategoryPopover",
            template: `<button type="button" class="cat-stub" @click="$emit('category-change', 'tours')">change</button>`,
          },
        },
      },
    });

    await wrapper.get("button.cat-stub").trigger("click");
    await wrapper.get("input[placeholder]").setValue("guide");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("init-search")?.[0]).toEqual([
      "guide",
      DEFAULT_LIMIT,
      AVAILABLE_SEARCH_CATEGORIES.TOURS,
    ]);
  });

  it("associates an accessible label with the search input", () => {
    const wrapper = mount(SearchForm, {
      global: { stubs: { CategoryPopover: true } },
    });
    const input = wrapper.get(`#cairn-search-query`);
    const label = wrapper.get(`label[for="cairn-search-query"]`);
    expect(label.text()).toBe(SEARCH_INPUT_LABEL);
    expect(input.attributes("placeholder")).toBe(SEARCH_INPUT_LABEL);
  });
});
