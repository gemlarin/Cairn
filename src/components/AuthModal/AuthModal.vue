<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import CloseIcon from "@/assets/close.svg";
import {
  DEFAULT_SIGN_IN,
  DEFAULT_CREATE_ACCOUNT,
  DEFAULT_NEW_HERE,
  DEFAULT_ALREADY_HAVE_AN_ACCOUNT,
  DEFAULT_WELCOME_BACK,
  DEFAULT_JOIN_CAIRN,
  DEFAULT_WELCOME_BACK_MESSAGE,
  DEFAULT_JOIN_CAIRN_MESSAGE,
  DEFAULT_EMAIL,
  DEFAULT_PASSWORD,
  MODE_SIGN_IN,
  MODE_CREATE_ACCOUNT,
  DEFAULT_NAME,
  DEFAULT_NAME_LABEL,
  DEFAULT_EMAIL_LABEL,
  DEFAULT_PASSWORD_LABEL,
  DEFAULT_CONFIRM_EMAIL_TITLE,
  DEFAULT_CONFIRM_EMAIL_MESSAGE,
  DEFAULT_EMAIL_NOT_CONFIRMED,
  DEFAULT_ERROR,
  type Mode,
} from "@/types/nps";

const authStore = useAuthStore();

const mode = ref<"in" | "up">("in");
const name = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const err = ref<string>("");
const awaitingEmailConfirm = ref(false);

const emit = defineEmits<{
  (e: "close"): void;
}>();

function onClose() {
  emit("close");
}

function setMode(newMode: Mode) {
  err.value = "";
  awaitingEmailConfirm.value = false;
  mode.value = newMode;
}

function mapAuthError(e: unknown): string {
  if (e instanceof Error && e.message === "EMAIL_NOT_CONFIRMED") {
    return DEFAULT_EMAIL_NOT_CONFIRMED;
  }
  if (e instanceof Error) return e.message;
  return DEFAULT_ERROR;
}

async function submit() {
  err.value = "";
  try {
    if (mode.value === MODE_SIGN_IN) {
      await authStore.signIn(email.value, password.value);
      onClose();
      return;
    }

    const result = await authStore.signUp(
      email.value,
      password.value,
      name.value || undefined,
    );

    if (result.status === "confirm_email") {
      awaitingEmailConfirm.value = true;
      password.value = "";
      return;
    }

    onClose();
  } catch (e) {
    err.value = mapAuthError(e);
  }
}
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
  >
    <div class="absolute inset-0 bg-foreground/50" @click="onClose" />
    <div
      class="relative bg-background border border-border w-full sm:max-w-xs p-8 shadow-lg"
    >
      <button
        @click="onClose"
        class="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
        aria-label="Close"
      >
        <img :src="CloseIcon" alt="Close" class="w-4 h-4" />
      </button>

      <template v-if="awaitingEmailConfirm">
        <h2 class="font-serif text-2xl text-foreground mb-1 leading-snug">
          {{ DEFAULT_CONFIRM_EMAIL_TITLE }}
        </h2>
        <p class="text-xs text-muted-foreground mb-7 leading-relaxed">
          {{ DEFAULT_CONFIRM_EMAIL_MESSAGE }}
        </p>
        <button
          type="button"
          class="w-full py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 hover:scale-99 cursor-pointer transition-all"
          @click="setMode(MODE_SIGN_IN)"
        >
          {{ DEFAULT_SIGN_IN }}
        </button>
      </template>

      <template v-else>
        <h2 class="font-serif text-2xl text-foreground mb-1 leading-snug">
          {{ mode === MODE_SIGN_IN ? DEFAULT_WELCOME_BACK : DEFAULT_JOIN_CAIRN }}
        </h2>
        <p class="text-xs text-muted-foreground mb-7 leading-relaxed">
          {{
            mode === MODE_SIGN_IN
              ? DEFAULT_WELCOME_BACK_MESSAGE
              : DEFAULT_JOIN_CAIRN_MESSAGE
          }}
        </p>

        <form @submit.prevent="submit" class="space-y-4">
          <div v-if="mode === MODE_CREATE_ACCOUNT">
            <label
              class="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5"
            >
              {{ DEFAULT_NAME_LABEL }}
            </label>
            <input
              v-model="name"
              type="text"
              required
              :placeholder="DEFAULT_NAME"
              class="w-full border border-border bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5"
            >
              {{ DEFAULT_EMAIL_LABEL }}
            </label>
            <input
              v-model="email"
              type="email"
              required
              :placeholder="DEFAULT_EMAIL"
              class="w-full border border-border bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5"
            >
              {{ DEFAULT_PASSWORD_LABEL }}
            </label>
            <input
              v-model="password"
              type="password"
              required
              :placeholder="DEFAULT_PASSWORD"
              class="w-full border border-border bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <p v-if="err" class="text-xs text-accent">{{ err }}</p>
          <button
            type="submit"
            class="w-full py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 hover:scale-99 cursor-pointer transition-all mt-1"
          >
            <span>
              {{
                mode === "in" ? DEFAULT_SIGN_IN : DEFAULT_CREATE_ACCOUNT
              }}</span
            >
          </button>
        </form>

        <p class="text-xs text-muted-foreground mt-5 text-center">
          {{
            mode === "in" ? DEFAULT_NEW_HERE : DEFAULT_ALREADY_HAVE_AN_ACCOUNT
          }}
          <button
            @click="
              setMode(
                mode === MODE_SIGN_IN ? MODE_CREATE_ACCOUNT : MODE_SIGN_IN,
              )
            "
            class="text-accent underline-offset-2 hover:underline transition-colors cursor-pointer text-xs font-bold"
          >
            {{ mode === "in" ? DEFAULT_CREATE_ACCOUNT : DEFAULT_SIGN_IN }}
          </button>
        </p>
      </template>
    </div>
  </div>
</template>
