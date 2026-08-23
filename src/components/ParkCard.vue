<script setup lang="ts">
const props = defineProps(["park"]);
const image = props.park.images[0];
</script>

<template>
  <button
    class="group w-full text-left border border-border hover:border-foreground/40 transition-colors bg-card"
  >
    <div className="relative overflow-hidden bg-muted aspect-[4/3]">
      <img
        v-if="image"
        :src="image?.url"
        :alt="image.altText || park.fullName"
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
      />
      <div
        v-else
        class="w-full h-full bg-muted flex items-center justify-center"
      >
        <span className="text-muted-foreground/30 font-serif text-4xl">↑</span>
      </div>
    </div>
    <div class="">dfd</div>
  </button>
</template>
