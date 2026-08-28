// visits store
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { type VisitRow, type VisitNote, type VisitUpsert } from "@/types/nps";

export async function upsertVisit(partial: VisitUpsert): Promise<VisitRow> {
  const userId = await requireUserId();
  // 1. Load existing row (if any) so we can merge
  const { data: existing, error: existingError } = await supabase
    .from("visits")
    .select("*")
    .eq("user_id", userId)
    .eq("item_id", partial.item_id)
    .maybeSingle();
  if (existingError) throw existingError;
  // 2. Merge: only overwrite fields you passed in
  const row = {
    user_id: userId,
    item_id: partial.item_id,
    visited: partial.visited ?? existing?.visited ?? false,
    note: partial.note !== undefined ? partial.note : (existing?.note ?? null),
    saved_on:
      partial.saved_on !== undefined
        ? partial.saved_on
        : (existing?.saved_on ?? null),
    updated_at: new Date().toISOString(),
  };
  // 3. Insert or update on unique (user_id, item_id)
  const { data, error } = await supabase
    .from("visits")
    .upsert(row, { onConflict: "user_id,item_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Require User ID: ${error.message}`);
  const userId = data.user?.id;
  if (!userId) throw new Error("Require User ID: Not signed in");
  return userId;
}

export async function fetchVisits(): Promise<VisitRow[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

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
    hasAddedNote: (state) => {
      return (id: string) => state.notes.some((note) => note.id === id);
    },
  },
  actions: {
    clear() {
      this.visited = [];
      this.notes = [];
    },
    async loadFromSupabase() {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) {
        this.clear();
        return;
      }
      const rows = await fetchVisits();
      // Session may have ended while the request was in flight
      if (!useAuthStore().isSignedIn) return;
      this.visited = rows
        .filter((row) => row.visited)
        .map((row) => row.item_id);
      this.notes = rows
        .filter((row) => row.note != null && row.note.length > 0)
        .map((row) => ({
          id: row.item_id,
          note: row.note as string,
          savedOn: row.saved_on ? Date.parse(row.saved_on) : null,
        }));
    },
    async addVisited(id: string) {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      // Optimistic: update UI first, then persist
      const already = this.visited.includes(id);
      if (!already) this.visited.push(id);

      try {
        await upsertVisit({ item_id: id, visited: true });
      } catch (error) {
        if (!already) {
          this.visited = this.visited.filter((visited) => visited !== id);
        }
        throw error;
      }
    },
    async removeVisited(id: string) {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      const previous = [...this.visited];
      this.visited = this.visited.filter((visited) => visited !== id);

      try {
        await upsertVisit({ item_id: id, visited: false });
      } catch (error) {
        this.visited = previous;
        throw error;
      }
    },
    getNote(id: string) {
      return this.notes.find((note) => note.id === id)?.note;
    },
    /** Persist draft text. Updates store only after a successful save path. */
    async saveNote(
      id: string,
      note: string,
      remove: boolean = false,
    ): Promise<VisitNote | undefined> {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      this.savingNote = true;
      try {
        if (remove) {
          await upsertVisit({ item_id: id, note: null, saved_on: null });
          this.notes = this.notes.filter((entry) => entry.id !== id);
          return undefined;
        }

        const savedOn = Date.now();
        await upsertVisit({
          item_id: id,
          note,
          saved_on: new Date(savedOn).toISOString(),
        });
        const toSave: VisitNote = { id, note, savedOn };

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
