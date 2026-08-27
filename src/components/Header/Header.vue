<script setup lang="ts">
import { RouterLink } from "vue-router";
import Logo from "@/assets/logo.svg";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { isSignedIn, user } = storeToRefs(authStore);

const openSignInModal = () => {
  authStore.openSignInModal();
};

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
    <div class="signin col-span-1 flex justify-end items-center gap-2">
      <span
        v-if="isSignedIn && (user?.name || user?.email)"
        class="text-xs text-muted-foreground"
        >{{ user?.name || user?.email }}</span
      ><span v-if="isSignedIn && (user?.name || user?.email)">|</span>
      <button
        v-if="!isSignedIn"
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
        @click="openSignInModal"
      >
        Sign In
      </button>
      <button
        v-else
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
        @click="signout"
      >
        Sign Out
      </button>
    </div>
  </header>
</template>
