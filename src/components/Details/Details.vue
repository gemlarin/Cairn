<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSearchStore } from "@/stores/search";
import { useResultDetails } from "@/composables/useResultDetails";
import type { AvailableSearchCategories } from "@/types/nps";
import { useSignInModal } from "@/composables/useOpenSignInModal";
import { useAuthStore } from "@/stores/auth";
import { useVisitsStore } from "@/stores/visits";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const visitsStore = useVisitsStore();
const { addVisited, removeVisited, isVisited, saveNote } = visitsStore;
const { isSignedIn } = storeToRefs(authStore);
const { notes, savingNote } = storeToRefs(visitsStore);
const { toggleSignInModal } = useSignInModal();
const { signout } = authStore;

const searchStore = useSearchStore();
const props = defineProps<{
  category: AvailableSearchCategories;
  id: string;
}>();

const result = computed(() => searchStore.findById(props.id));
const details = useResultDetails(result, () => props.category);

const draft = ref("");
/** Button label state — set true only after a successful save; cleared on edit. */
const isNoteSaved = ref(false);

watch(
  () => props.id,
  (id) => {
    const entry = notes.value.find((note) => note.id === id);
    draft.value = entry?.note ?? "";
    isNoteSaved.value = !!entry && entry.savedOn !== null;
  },
  { immediate: true },
);

const noteSavedOn = computed(
  () => notes.value.find((note) => note.id === props.id)?.savedOn ?? undefined,
);

const handleVisitToggle = () => {
  if (isVisited(props.id)) {
    removeVisited(props.id);
  } else {
    addVisited(props.id);
  }
};

const onDraftInput = () => {
  isNoteSaved.value = false;
};

const handleSaveNote = async () => {
  if (isNoteSaved.value || savingNote.value) return;

  const saved = await saveNote(props.id, draft.value);
  if (saved) {
    isNoteSaved.value = true;
  }
};

const handleNoteFocus = () => {
  if (!isSignedIn.value) {
    toggleSignInModal();
  }
};
</script>

<template>
  <div class="lg:flex-1 px-6 sm:px-10 lg:px-14 py-10 lg:py-16 lg:min-h-screen">
    <div class="max-w-md">
      <p
        class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-2.5"
      >
        {{ details.label }}&ensp;·&ensp;{{ details.states }}
      </p>
      <h1
        class="font-serif text-2xl sm:text-[2.4rem] text-foreground leading-[1.1] mb-10"
      >
        {{ details.title }}
      </h1>
      <div
        class="border-t border-b border-border p-5 flex items-center justify-between"
      >
        <button
          type="button"
          @click="handleVisitToggle"
          class="flex items-center gap-3 group min-h-11 cursor-pointer"
          :aria-label="
            isVisited(props.id) ? 'Unmark visited' : 'Mark as visited'
          "
        >
          <span class="size-8 flex items-center justify-center bg-muted border"
            ><svg
              v-if="isVisited(props.id)"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-check"
            >
              <path d="M20 6 9 17l-5-5" /></svg
          ></span>

          <span
            class="font-serif text-xl text-foreground leading-none select-none"
          >
            I was here.
          </span>
        </button>
        <button
          v-if="!isSignedIn"
          type="button"
          @click="toggleSignInModal"
          class="text-[0.625rem] text-muted-foreground cursor-pointer underline underline-offset-2 hover:text-foreground transition-colors tracking-wide py-2"
        >
          Sign in to save
        </button>
        <button
          v-else
          type="button"
          @click="signout"
          class="text-[0.625rem] text-muted-foreground cursor-pointer underline underline-offset-2 hover:text-foreground transition-colors tracking-wide py-2"
        >
          Sign out
        </button>
      </div>
      <div class="mt-7">
        <p class="text-[14px] text-foreground mb-7">
          {{ details.description }}
        </p>
        <p
          class="text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground mb-3"
        >
          Visit Notes
        </p>
        <div class="relative">
          <textarea
            v-model="draft"
            @input="onDraftInput"
            @focus="handleNoteFocus"
            placeholder="What did you see? What do you want to remember?"
            :rows="6"
            class="w-full border border-border bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none font-mono leading-relaxed"
          />
          <div
            v-if="savingNote"
            class="flex items-center w-full justify-center absolute bottom-1/2 translate-y-1/2"
          >
            <div
              class="w-8 h-8 border-4 border-ring border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3">
          <p class="text-[10px] text-muted-foreground" v-if="noteSavedOn">
            Last saved
            {{
              new Date(noteSavedOn).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }}
          </p>
          <button
            type="button"
            @click="handleSaveNote"
            :disabled="isNoteSaved || savingNote"
            :class="
              isNoteSaved
                ? 'bg-muted text-muted-foreground cursor-default'
                : 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
            "
            class="ml-auto px-5 py-2.5 text-[10px] uppercase tracking-widest transition-all min-h-10"
          >
            {{ isNoteSaved ? "Saved" : "Save Note" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
