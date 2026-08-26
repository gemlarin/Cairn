// visits store
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

export type VisitNote = {
  id: string;
  note: string;
  /** Timestamp of last successful save; null until first save. */
  savedOn: number | null;
};

export const useVisitsStore = defineStore("visits", {
  state: () => ({
    visited: [] as string[],
    notes: [] as VisitNote[],
    savingNote: false,
  }),
  getters: {
    isVisited: (state) => {
      return (id: string) => state.visited.includes(id);
    },
    savedOn: (state) => {
      return (id: string) =>
        state.notes.find((note) => note.id === id)?.savedOn ?? undefined;
    },
  },
  actions: {
    addVisited(id: string) {
      // Call useAuthStore inside the action (not at module top-level)
      //   const authStore = useAuthStore();
      //   if (!authStore.isSignedIn) {
      //     return;
      //   }
      // TODO: await upsertVisited(id) to Supabase
      // If the request fails, leave the store unchanged and rethrow / return undefined

      if (!this.visited.includes(id)) {
        this.visited.push(id);
      }
    },
    removeVisited(id: string) {
      const authStore = useAuthStore();
      //   if (!authStore.isSignedIn) {
      //     return;
      //   }
      this.visited = this.visited.filter((visited) => visited !== id);
    },
    getNote(id: string) {
      return this.notes.find((note) => note.id === id)?.note;
    },
    /** Persist draft text. Updates store only after a successful save path. */
    async saveNote(id: string, note: string): Promise<VisitNote | undefined> {
      const authStore = useAuthStore();
      //   if (!authStore.isSignedIn) {
      //     return undefined;
      //   }

      this.savingNote = true;
      try {
        const toSave: VisitNote = {
          id,
          note,
          savedOn: Date.now(),
        };

        // TODO: await upsertVisitNote(toSave) to Supabase
        // If the request fails, leave the store unchanged and rethrow / return undefined

        const exists = this.notes.some((entry) => entry.id === id);
        this.notes = exists
          ? this.notes.map((entry) => (entry.id === id ? toSave : entry))
          : [...this.notes, toSave];

        return toSave;
      } finally {
        this.savingNote = false;
      }
    },
  },
});
