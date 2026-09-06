<script setup lang="ts">
import Silhouette from "@/assets/silhoette.svg";
</script>

<template>
  <div class="w-full">
    <div class="flex justify-center px-3 sm:px-5">
      <img
        :src="Silhouette"
        alt=""
        class="footer-silhouette w-full max-w-[800px] h-auto"
        aria-hidden="true"
      />
    </div>
    <footer class="w-full bg-foreground">
      <div class="container mx-auto px-4 py-2">
        <p class="text-center text-sm text-muted-foreground">
          &copy; 2026 Cairn. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.footer-silhouette {
  display: block;
  position: relative;
  top: 2px;
}
</style>
