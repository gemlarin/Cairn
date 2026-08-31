import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Pagination from "./Pagination.vue";

describe("Pagination", () => {
  it("hides when there is only one page", () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, totalPages: 1 },
    });
    expect(wrapper.find("nav").exists()).toBe(false);
  });

  it("shows page label and disables previous on first page", () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, totalPages: 3 },
    });
    expect(wrapper.text()).toContain("Page 1 of 3");
    expect(
      wrapper.get('button[aria-label="Previous page"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.get('button[aria-label="Next page"]').attributes("disabled"),
    ).toBeUndefined();
  });

  it("emits update:page when next is clicked", async () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, totalPages: 3 },
    });
    await wrapper.get('button[aria-label="Next page"]').trigger("click");
    expect(wrapper.emitted("update:page")?.[0]).toEqual([2]);
  });

  it("emits update:page when previous is clicked", async () => {
    const wrapper = mount(Pagination, {
      props: { page: 2, totalPages: 3 },
    });
    await wrapper.get('button[aria-label="Previous page"]').trigger("click");
    expect(wrapper.emitted("update:page")?.[0]).toEqual([1]);
  });

  it("does not emit next on the last page", async () => {
    const wrapper = mount(Pagination, {
      props: { page: 3, totalPages: 3 },
    });
    await wrapper.get('button[aria-label="Next page"]').trigger("click");
    expect(wrapper.emitted("update:page")).toBeUndefined();
  });
});
