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
    class="grid grid-cols-4 items-center justify-between pt-10 pb-8 border-b border-border pl-5 pr-5"
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
            National Parks travel log.
          </p>
        </div>
      </RouterLink>
    </div>
    <div class="signin col-span-1 flex justify-end items-center gap-2">
      <RouterLink
        v-if="isSignedIn && route.name !== 'fieldlog'"
        to="/fieldlog"
        class="text-xs font-medium cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
        >Field Log
        <span class="text-muted-foreground"
          >({{ totalNumberOfVisits }})</span
        ></RouterLink
      >
      <RouterLink
        v-if="route.name == 'fieldlog'"
        to="/"
        class="text-xs font-medium cursor-pointer text-accent underline-offset-2 hover:underline transition-colors flex items-center gap-1 py-2"
        ><img :src="BackArrow" class="size-4 text-accent" alt="back" />Search
        parks</RouterLink
      >
      <span v-if="isSignedIn" class="text-accent">|</span>
      <span
        v-if="route.name == 'fieldlog'"
        class="text-xs font-medium text-foreground underline-offset-2 py-2"
        >Field Log</span
      >
      <button
        v-if="!isSignedIn && route.name !== 'fieldlog'"
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
        @click="openSignInModal"
      >
        Sign In
      </button>
      <button
        v-else-if="route.name !== 'fieldlog'"
        class="text-xs cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
        @click="signout"
      >
        Sign Out
      </button>
    </div>
  </header>
</template>
