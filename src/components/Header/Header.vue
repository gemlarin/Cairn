<script setup lang="ts">
import { RouterLink } from "vue-router";
import Logo from "@/assets/logo.svg";
import { useAuthStore } from "@/stores/auth";
import { useVisitsStore } from "@/stores/visits";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import BackArrow from "@/assets/back-arrow.svg";
const route = useRoute();

const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
const visitsStore = useVisitsStore();
const { totalNumberOfVisits } = storeToRefs(visitsStore);

const openSignInModal = () => {
  authStore.openSignInModal();
};

const { signout } = authStore;
</script>
<template>
  <header
    class="relative flex items-center justify-between gap-3 pt-10 pb-8 border-b border-border px-3 sm:px-5"
  >
    <div class="logo min-w-0 flex-1 pr-28 sm:pr-36">
      <RouterLink
        to="/"
        class="flex items-center gap-1.5 no-underline text-inherit"
      >
        <img :src="Logo" class="size-12 shrink-0" alt="logo" />
        <div class="min-w-0">
          <h1
            id="title"
            class="font-serif text-3xl lg:text-[2.1rem] text-foreground tracking-tight leading-none"
          >
            Cairn
          </h1>
          <p
            id="subtitle"
            class="text-xs sm:text-[0.65rem] text-muted-foreground mt-1 tracking-wide"
          >
            National Parks travel log.
          </p>
        </div>
      </RouterLink>
    </div>
    <nav
      class="signin absolute top-[15px] right-3 sm:right-5 flex shrink-0 justify-end items-center gap-2 whitespace-nowrap"
      aria-label="Account"
    >
      <RouterLink
        v-if="isSignedIn && route.name !== 'fieldlog'"
        to="/fieldlog"
        class="text-xs font-medium cursor-pointer text-accent underline-offset-2 hover:underline transition-colors"
        >Field Log
        <span class="text-muted-foreground"
          >({{ totalNumberOfVisits }})</span
        ></RouterLink
      >
      <RouterLink
        v-if="route.name == 'fieldlog'"
        to="/"
        class="text-xs font-medium cursor-pointer text-accent underline-offset-2 hover:underline transition-colors flex items-center gap-1"
        ><img
          :src="BackArrow"
          class="size-4 text-accent"
          alt=""
          aria-hidden="true"
        />Search parks</RouterLink
      >
      <span v-if="isSignedIn" class="text-accent" aria-hidden="true">|</span>
      <span
        v-if="route.name == 'fieldlog'"
        class="text-xs font-medium text-foreground underline-offset-2"
        >Field Log</span
      >
      <button
        v-if="!isSignedIn && route.name !== 'fieldlog'"
        type="button"
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors"
        @click="openSignInModal"
      >
        Sign In
      </button>
      <button
        v-else-if="route.name !== 'fieldlog'"
        type="button"
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors"
        @click="signout"
      >
        Sign Out
      </button>
    </nav>
  </header>
</template>
