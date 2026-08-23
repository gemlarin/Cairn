<script setup lang="ts">
import Logo from "./../assets/logo.svg";
</script>
<template>
  <header
    class="grid grid-cols-4 items-center justify-between pt-10 pb-8 border-b border-border"
  >
    <div class="logo col-span-3">
      <div class="flex items-center gap-1.5">
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
            A personal National Parks travel log.
          </p>
        </div>
      </div>
    </div>
    <div class="signin col-span-1 flex justify-end">
      <button
        class="text-xs text-foreground underline underline-offset-2 hover:text-primary transition-colors py-2"
      >
        Sign In
      </button>
    </div>
  </header>
</template>
