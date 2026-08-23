<script setup lang="ts">
import ParkCard from "./ParkCard.vue";
defineProps(["error", "loading", "parks", "searched", "term"]);
</script>
<template>
  <div id="results-area" class="mt-10 pb-20">
    <p class=""></p>
    <p
      v-if="parks.length > 0"
      class="parks text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-6"
    >
      {{ parks.length }} RESULTS
    </p>
    <p v-if="error" id="error" class="text-sm text-accent text-center py-12">
      {{ error }}
    </p>
    <p
      v-if="searched && !loading && parks.length === 0 && !error"
      className="text-sm text-muted-foreground text-center py-16"
    >
      No parks found for "{{ term }}."
    </p>
    <p
      v-if="!searched && !loading"
      className="text-sm text-muted-foreground text-center py-16 leading-relaxed"
    >
      Search to find parks across the United States.
      <br />
      <span className="text-xs opacity-70">
        Try "Yosemite," "Alaska," or "canyon."
      </span>
    </p>
    <ParkCard v-for="park in parks" :park :key="park.parkCode" />
  </div>
</template>
