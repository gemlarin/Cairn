import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import AuthModal from "./AuthModal.vue";
import { useAuthStore } from "@/stores/auth";
import {
  DEFAULT_WELCOME_BACK,
  DEFAULT_JOIN_CAIRN,
  DEFAULT_SIGN_IN,
  DEFAULT_CREATE_ACCOUNT,
  DEFAULT_CONFIRM_EMAIL_TITLE,
} from "@/types/nps";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}));

function mountModal() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return {
    wrapper: mount(AuthModal, {
      global: { plugins: [pinia] },
    }),
    authStore: useAuthStore(),
  };
}

describe("AuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign-in mode by default", () => {
    const { wrapper } = mountModal();
    expect(wrapper.text()).toContain(DEFAULT_WELCOME_BACK);
    expect(wrapper.text()).toContain(DEFAULT_SIGN_IN);
  });

  it("emits close when the backdrop is clicked", async () => {
    const { wrapper } = mountModal();
    await wrapper.find(".absolute.inset-0").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("switches to create-account mode", async () => {
    const { wrapper } = mountModal();
    const createLink = wrapper
      .findAll("button")
      .find((b) => b.text().includes(DEFAULT_CREATE_ACCOUNT));
    expect(createLink).toBeTruthy();
    await createLink!.trigger("click");
    expect(wrapper.text()).toContain(DEFAULT_JOIN_CAIRN);
  });

  it("calls signIn and closes on success", async () => {
    const { wrapper, authStore } = mountModal();
    authStore.signIn = vi.fn().mockResolvedValue(undefined);

    await wrapper.get("#auth-email").setValue("a@b.com");
    await wrapper.get("#auth-password").setValue("secret");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(authStore.signIn).toHaveBeenCalledWith("a@b.com", "secret");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("shows confirm-email state after sign-up without session", async () => {
    const { wrapper, authStore } = mountModal();
    authStore.signUp = vi
      .fn()
      .mockResolvedValue({ status: "confirm_email" });

    const createLink = wrapper
      .findAll("button")
      .find((b) => b.text().includes(DEFAULT_CREATE_ACCOUNT));
    await createLink!.trigger("click");

    await wrapper.get("#auth-name").setValue("Danny");
    await wrapper.get("#auth-email").setValue("a@b.com");
    await wrapper.get("#auth-password").setValue("secret");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain(DEFAULT_CONFIRM_EMAIL_TITLE);
  });

  it("emits close when Escape is pressed", async () => {
    const { wrapper } = mountModal();
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("exposes dialog semantics and labelled inputs", () => {
    const { wrapper } = mountModal();
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes("aria-modal")).toBe("true");
    expect(dialog.attributes("aria-labelledby")).toBe("auth-modal-title");
    expect(wrapper.get('label[for="auth-email"]').text()).toContain(
      "Email",
    );
    expect(wrapper.get("#auth-email").exists()).toBe(true);
  });

  it("announces sign-in errors with role=alert", async () => {
    const { wrapper, authStore } = mountModal();
    authStore.signIn = vi.fn().mockRejectedValue(new Error("Bad creds"));

    await wrapper.get("#auth-email").setValue("a@b.com");
    await wrapper.get("#auth-password").setValue("nope");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain("Bad creds");
  });
});
