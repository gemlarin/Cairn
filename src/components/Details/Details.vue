<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSearchStore } from "@/stores/search";
import { useResultDetails } from "@/composables/useResultDetails";
import type { AvailableSearchCategories, NpsResult } from "@/types/nps";
import { useAuthStore } from "@/stores/auth";
import { useVisitsStore } from "@/stores/visits";
import { storeToRefs } from "pinia";
import { getById, resolveNpsItem } from "@/api/nps";

const authStore = useAuthStore();
const visitsStore = useVisitsStore();
const { addVisited, removeVisited, isVisited, saveNote } = visitsStore;
const { isSignedIn } = storeToRefs(authStore);
const { notes, savingNote, visitError, noteError } = storeToRefs(visitsStore);
const { signout, openSignInModal } = authStore;

const searchStore = useSearchStore();
const props = defineProps<{
  category: AvailableSearchCategories;
  id: string;
}>();

const fetched = ref<NpsResult | null>(null);

const result = computed(() => {
  return (
    searchStore.findById(props.id) ||
    visitsStore.visitedItems.find((item) => item.id === props.id)?.result ||
    fetched.value ||
    undefined
  );
});

watch(
  () => [props.id, props.category] as const,
  async ([id, category]) => {
    fetched.value = null;
    if (searchStore.findById(id)) return;
    const fromLog = visitsStore.visitedItems.find((item) => item.id === id);
    if (fromLog?.result) {
      searchStore.cacheResults([fromLog.result]);
      return;
    }
    const direct = await getById(category, id);
    if (direct) {
      fetched.value = direct;
      searchStore.cacheResults([direct]);
      return;
    }
    const resolved = await resolveNpsItem(id, category);
    if (resolved) {
      fetched.value = resolved.result;
      searchStore.cacheResults([resolved.result]);
    }
  },
  { immediate: true },
);

const details = useResultDetails(result, () => props.category);

const draft = ref("");
/** Checkbox can toggle off; a lone radio cannot. */
const markNoteForDelete = ref(false);

const savedNoteEntry = computed(() =>
  notes.value.find((note) => note.id === props.id && note.savedOn !== null),
);

const hasSavedNote = computed(() => !!savedNoteEntry.value);

const savedNoteText = computed(() => savedNoteEntry.value?.note ?? "");

/** True when draft is new non-empty text or differs from the saved note. */
const isDraftDirty = computed(() => {
  if (!hasSavedNote.value) return draft.value.trim().length > 0;
  return draft.value !== savedNoteText.value;
});

/**
 * Save enabled only when:
 * 1. User entered new text (no saved note yet), or
 * 2. User edited existing saved text, or
 * 3. Delete is checked and a saved note exists
 * Delete must not clear Save when the draft is already dirty.
 */
const canSave = computed(() => {
  if (savingNote.value) return false;
  return isDraftDirty.value || (markNoteForDelete.value && hasSavedNote.value);
});

const saveButtonLabel = computed(() => {
  if (canSave.value) return "Save Note";
  return hasSavedNote.value ? "Saved" : "Save Note";
});

watch(
  [() => props.id, notes],
  ([id]) => {
    const entry = notes.value.find((note) => note.id === id);
    draft.value = entry?.note ?? "";
    markNoteForDelete.value = false;
  },
  { immediate: true },
);

watch(hasSavedNote, (hasNote) => {
  if (!hasNote) markNoteForDelete.value = false;
});

const noteSavedOn = computed(
  () => notes.value.find((note) => note.id === props.id)?.savedOn ?? undefined,
);

const handleVisitToggle = async () => {
  if (!isSignedIn.value) {
    openSignInModal();
    return;
  }
  try {
    if (isVisited(props.id)) {
      await removeVisited(props.id);
    } else {
      await addVisited(props.id, props.category);
    }
  } catch {
    // visitError set in the store
  }
};

const handleNoteInteract = () => {
  if (!isSignedIn.value) {
    openSignInModal();
  }
};

const handleSaveNote = async () => {
  if (!isSignedIn.value) {
    openSignInModal();
    return;
  }
  if (!canSave.value) return;

  try {
    if (markNoteForDelete.value) {
      await saveNote(props.id, draft.value, true);
      draft.value = "";
      markNoteForDelete.value = false;
      return;
    }

    await saveNote(props.id, draft.value, false);
  } catch {
    // noteError set in the store; keep draft + Delete checked for retry
  }
};
</script>

<template>
  <div class="lg:flex-1 px-3 sm:px-10 lg:px-14 py-10 lg:py-16 lg:min-h-screen">
    <div class="max-w-md">
      <p
        class="text-xs sm:text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground mb-2.5"
      >
        {{ details.label }}&ensp;·&ensp;{{ details.states }}
      </p>
      <h1
        class="font-serif text-2xl sm:text-[2.4rem] text-foreground leading-[1.1] mb-10"
      >
        {{ details.title }}
      </h1>
      <div
        class="border-t border-b border-border p-5 flex flex-col gap-2"
        :class="{ 'items-end': category === 'people' }"
      >
        <div
          class="flex w-full items-center justify-between"
          :class="{ 'justify-end': category === 'people' }"
        >
          <button
            type="button"
            v-if="category !== 'people'"
            @click="handleVisitToggle"
            class="flex items-center gap-3 group min-h-11 cursor-pointer group"
            :aria-label="
              isVisited(props.id) ? 'Unmark visited' : 'Mark as visited'
            "
          >
            <span
              class="size-8 flex items-center justify-center bg-muted border group-hover:scale-97 transition-transform duration-200"
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
          <span>
            <button
              v-if="!isSignedIn"
              type="button"
              @click="openSignInModal"
              class="text-xs sm:text-[0.625rem] cursor-pointer text-accent underline-offset-2 hover:underline transition-colors py-2"
            >
              Sign in to save
            </button>
            <button
              v-else
              type="button"
              @click="signout"
              class="text-xs sm:text-[0.625rem] text-accent cursor-pointer underline-offset-2 hover:underline transition-colors tracking-wide py-2"
            >
              Sign out
            </button>
          </span>
        </div>
        <div
          v-if="visitError"
          role="alert"
          class="w-full text-xs sm:text-[0.625rem] text-red-500 text-left"
        >
          {{ visitError }}
        </div>
      </div>
      <div class="mt-7">
        <p class="text-xs sm:text-[0.6875rem] text-foreground mb-7">
          {{ details.description }}
        </p>
        <div class="flex items-center gap-2 mb-3">
          <p
            class="text-xs sm:text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span v-if="category !== 'people'">Visit Notes</span>
            <span v-else>People Notes</span>
          </p>
        </div>

        <div class="relative">
          <textarea
            :readonly="!isSignedIn"
            @click="handleNoteInteract"
            v-model="draft"
            placeholder="What did you see? What do you want to remember?"
            :rows="6"
            class="w-full border border-border bg-transparent px-3.5 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-foreground transition-colors resize-none font-mono leading-relaxed"
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
        <p
          v-if="noteError"
          role="alert"
          class="mt-2 text-xs sm:text-[0.625rem] text-red-500 text-left"
        >
          {{ noteError }}
        </p>
        <div class="flex items-center justify-between mt-3">
          <p class="text-xs sm:text-[0.625rem] text-muted-foreground" v-if="noteSavedOn">
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
            :disabled="!canSave"
            :class="
              canSave
                ? 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-default'
            "
            class="ml-auto px-5 py-2.5 text-xs sm:text-[0.625rem] uppercase hover:scale-99 tracking-widest transition-all min-h-10"
          >
            {{ saveButtonLabel }}
          </button>
        </div>
        <label
          class="mt-3 ml-auto flex w-fit items-center gap-2"
          :class="
            hasSavedNote ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          "
        >
          <input
            v-model="markNoteForDelete"
            type="checkbox"
            id="remove-note"
            class="peer sr-only"
            :disabled="!hasSavedNote"
          />
          <span
            class="size-4 shrink-0 rounded-full border border-muted-foreground flex items-center justify-center after:content-[''] after:size-2 after:rounded-full after:bg-transparent peer-checked:border-accent peer-checked:after:bg-accent peer-enabled:peer-focus-visible:outline peer-enabled:peer-focus-visible:outline-2 peer-enabled:peer-focus-visible:outline-offset-2 peer-enabled:peer-focus-visible:outline-accent"
            aria-hidden="true"
          />
          <span
            class="text-xs sm:text-[0.625rem] text-muted-foreground peer-checked:text-accent"
          >
            Delete Note
          </span>
        </label>
      </div>
      <div class="mt-5 pt-7 border-t border-border">
        <a
          :href="details.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs sm:text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Official NPS page →
        </a>
      </div>
    </div>
  </div>
</template>
