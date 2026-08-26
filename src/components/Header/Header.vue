<script setup lang="ts">
import { RouterLink } from "vue-router";
import Logo from "@/assets/logo.svg";
import { useSignInModal } from "@/composables/useOpenSignInModal";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
const { toggleSignInModal } = useSignInModal();
const { signout } = authStore;
</script>
<template>
  <header
    class="grid grid-cols-4 items-center justify-between pt-10 pb-8 border-b border-border"
  >
    <div class="logo col-span-3">
      <RouterLink
        to="/"
        class="flex items-center gap-1.5 no-underline text-inherit"
      >
        <img :src="Logo" class="size-12" alt="logo" />
        <div>
          <h1
            id="title"
            class="font-serif text-3xl lg:text-[2.1rem] text-foreground tracking-tight leading-none"
          >
            Cairn
          </h1>
          <p
            id="subtitle"
            class="text-xs text-muted-foreground mt-1.2 tracking-wided"
          >
            Your personal National Parks travel log.
          </p>
        </div>
      </RouterLink>
    </div>
    <div class="signin col-span-1 flex justify-end">
      <button
        v-if="!isSignedIn"
        class="text-xs cursor-pointer text-foreground underline cursor-pointer underline-offset-2 hover:text-accent transition-colors py-2"
        @click="toggleSignInModal"
      >
        Sign In
      </button>
      <button
        v-else
        class="text-xs text-foreground cursor-pointer underline cursor-pointer underline-offset-2 hover:text-accent transition-colors py-2"
        @click="signout"
      >
        Sign Out
      </button>
    </div>
  </header>
</template>
