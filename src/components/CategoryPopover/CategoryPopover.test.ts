import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CategoryPopover from "./CategoryPopover.vue";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";

describe("CategoryPopover", () => {
  it("shows the default category label", () => {
    const wrapper = mount(CategoryPopover, {
      props: { defaultCategory: AVAILABLE_SEARCH_CATEGORIES.PARKS },
      attachTo: document.body,
    });
    expect(wrapper.text()).toContain("Parks");
  });

  it("emits category-change when a radio is selected", async () => {
    const wrapper = mount(CategoryPopover, {
      props: { defaultCategory: AVAILABLE_SEARCH_CATEGORIES.PARKS },
      attachTo: document.body,
    });

    const tours = wrapper.get(`input[value="${AVAILABLE_SEARCH_CATEGORIES.TOURS}"]`);
    await tours.setValue(true);
    await tours.trigger("change");

    expect(wrapper.emitted("category-change")?.[0]).toEqual([
      AVAILABLE_SEARCH_CATEGORIES.TOURS,
    ]);
    expect(wrapper.text()).toContain("Tours");
  });
});
