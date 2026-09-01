<script setup lang="ts">
import { nextTick, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { SKIP_TO_CONTENT } from "@/types/nps";

const mainEl = ref<HTMLElement | null>(null);
const router = useRouter();

router.afterEach(async () => {
  await nextTick();
  mainEl.value?.focus({ preventScroll: true });
});
</script>

<template>
  <a href="#main-content" class="skip-link">{{ SKIP_TO_CONTENT }}</a>
  <main id="main-content" ref="mainEl" tabindex="-1" class="outline-none">
    <RouterView />
  </main>
</template>
