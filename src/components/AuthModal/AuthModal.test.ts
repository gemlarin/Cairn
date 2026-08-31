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

    await wrapper.get('input[type="email"]').setValue("a@b.com");
    await wrapper.get('input[type="password"]').setValue("secret");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(authStore.signIn).toHaveBeenCalledWith("a@b.com", "secret");
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

    await wrapper.get('input[type="text"]').setValue("Danny");
    await wrapper.get('input[type="email"]').setValue("a@b.com");
    await wrapper.get('input[type="password"]').setValue("secret");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain(DEFAULT_CONFIRM_EMAIL_TITLE);
  });

  it("shows an error message when sign-in fails", async () => {
    const { wrapper, authStore } = mountModal();
    authStore.signIn = vi.fn().mockRejectedValue(new Error("Bad creds"));

    await wrapper.get('input[type="email"]').setValue("a@b.com");
    await wrapper.get('input[type="password"]').setValue("nope");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Bad creds");
  });
});
