// visits store
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { getByIds, resolveNpsItem } from "@/api/nps";
import { useSearchStore } from "@/stores/search";
import {
  type VisitRow,
  type VisitNote,
  type VisitUpsert,
  type AvailableSearchCategories,
  type NpsResult,
  AVAILABLE_SEARCH_CATEGORIES,
  DEFAULT_SAVE_ERROR,
  DEFAULT_FETCH_ERROR,
} from "@/types/nps";

export type VisitedItem = {
  id: string;
  category: AvailableSearchCategories;
  result: NpsResult | null;
  note: string | null;
  savedOn: number | null;
};

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
    category:
      partial.category !== undefined
        ? partial.category
        : (existing?.category ?? null),
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
  const visitsStore = useVisitsStore();
  visitsStore.loading = true;
  visitsStore.fetchError = null;
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("visits")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      visitsStore.fetchError = DEFAULT_FETCH_ERROR + " " + error.message;
      throw error;
    }
    return data ?? [];
  } finally {
    visitsStore.loading = false;
  }
}

export const useVisitsStore = defineStore("visits", {
  state: () => ({
    visited: [] as string[],
    /** item_id → NPS category (required to rehydrate details). */
    categories: {} as Record<string, AvailableSearchCategories>,
    notes: [] as VisitNote[],
    /** Hydrated NPS payloads for Field Log (null result = lookup failed). */
    visitedItems: [] as VisitedItem[],
    savingNote: false,
    /** Visit toggle error (checkbox row). */
    visitError: null as string | null,
    /** Fetch error. */
    fetchError: null as string | null,
    /** Note save/delete error. */
    noteError: null as string | null,
    /** Bumped to ignore stale loadFromSupabase results after local edits. */
    loadSeq: 0,
    loading: false,
    detailsLoading: false,
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
    totalNumberOfVisits: (state) => {
      return state.visited.length;
    },
  },
  actions: {
    clear() {
      this.loadSeq += 1;
      this.visited = [];
      this.categories = {};
      this.notes = [];
      this.visitedItems = [];
      this.visitError = null;
      this.noteError = null;
      this.fetchError = null;
    },
    async loadFromSupabase() {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) {
        this.clear();
        return;
      }

      const seq = ++this.loadSeq;
      const rows = await fetchVisits();

      // Stale: a newer load started, or the user edited visits while this was in flight
      if (seq !== this.loadSeq) return;
      if (!useAuthStore().isSignedIn) return;

      const visitedRows = rows.filter((row) => row.visited);
      this.visited = visitedRows.map((row) => row.item_id);
      this.categories = Object.fromEntries(
        visitedRows
          .filter((row) => row.category)
          .map((row) => [
            row.item_id,
            row.category as AvailableSearchCategories,
          ]),
      );
      this.notes = rows
        .filter((row) => row.note != null && row.note.length > 0)
        .map((row) => ({
          id: row.item_id,
          note: row.note as string,
          savedOn: row.saved_on ? Date.parse(row.saved_on) : null,
        }));
    },
    /**
     * Load NPS details for every visited id.
     * Uses stored category when present; probes all endpoints on miss
     * (legacy rows without category).
     */
    async loadVisitedDetails() {
      if (this.visited.length === 0) {
        this.visitedItems = [];
        return;
      }

      this.detailsLoading = true;
      this.fetchError = null;
      try {
        const resultsById = new Map<string, NpsResult>();
        const categoryById = {
          ...this.categories,
        } as Record<string, AvailableSearchCategories>;

        const setResult = (
          id: string,
          result: NpsResult,
          category: AvailableSearchCategories,
        ) => {
          categoryById[id] = category;
          this.categories[id] = category;
          for (const key of [id, result.id, result.parkCode]) {
            if (!key) continue;
            resultsById.set(key, result);
            resultsById.set(key.toLowerCase(), result);
            resultsById.set(key.toUpperCase(), result);
          }
        };

        // 1) Batch fetch by known category
        const byCategory = new Map<AvailableSearchCategories, string[]>();
        for (const id of this.visited) {
          const category = categoryById[id];
          if (!category) continue;
          const list = byCategory.get(category) ?? [];
          list.push(id);
          byCategory.set(category, list);
        }

        await Promise.all(
          [...byCategory.entries()].map(async ([category, ids]) => {
            const results = await getByIds(category, ids);
            for (const id of ids) {
              const result = results.find(
                (row) =>
                  row.id?.toLowerCase() === id.toLowerCase() ||
                  row.parkCode?.toLowerCase() === id.toLowerCase(),
              );
              if (result) setResult(id, result, category);
            }
          }),
        );

        // 2) Probe all categories for anything still missing
        const missing = this.visited.filter((id) => !resultsById.has(id));
        await Promise.all(
          missing.map(async (id) => {
            const resolved = await resolveNpsItem(id, categoryById[id] ?? null);
            if (!resolved) return;
            setResult(id, resolved.result, resolved.category);
            // Backfill category on legacy rows (best-effort)
            void upsertVisit({
              item_id: id,
              category: resolved.category,
              visited: true,
            }).catch(() => {});
          }),
        );

        this.visitedItems = this.visited.map((id) => {
          const noteEntry = this.notes.find((note) => note.id === id);
          const result =
            resultsById.get(id) ??
            resultsById.get(id.toLowerCase()) ??
            resultsById.get(id.toUpperCase()) ??
            null;
          const category =
            categoryById[id] ?? AVAILABLE_SEARCH_CATEGORIES.PARKS;
          return {
            id,
            category,
            result,
            note: noteEntry?.note ?? null,
            savedOn: noteEntry?.savedOn ?? null,
          };
        });

        // So Detail view can resolve these without a prior search
        const searchStore = useSearchStore();
        searchStore.cacheResults(
          this.visitedItems
            .map((item) => item.result)
            .filter((result): result is NpsResult => result != null),
        );
      } catch (error) {
        this.fetchError =
          DEFAULT_FETCH_ERROR +
          (error instanceof Error ? ` ${error.message}` : "");
        throw error;
      } finally {
        this.detailsLoading = false;
      }
    },
    async addVisited(id: string, category: AvailableSearchCategories) {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      this.visitError = null;
      this.loadSeq += 1;

      const already = this.visited.includes(id);
      if (!already) this.visited.push(id);
      this.categories[id] = category;

      try {
        await upsertVisit({ item_id: id, category, visited: true });
      } catch (error) {
        this.visitError = DEFAULT_SAVE_ERROR;
        if (!already) {
          this.visited = this.visited.filter((visited) => visited !== id);
          delete this.categories[id];
        }
        throw error;
      }
    },
    async removeVisited(id: string) {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      this.visitError = null;
      this.loadSeq += 1;

      const previous = [...this.visited];
      const previousCategory = this.categories[id];
      this.visited = this.visited.filter((visited) => visited !== id);
      delete this.categories[id];

      try {
        await upsertVisit({ item_id: id, visited: false });
      } catch (error) {
        this.visitError = DEFAULT_SAVE_ERROR;
        this.visited = previous;
        if (previousCategory) this.categories[id] = previousCategory;
        throw error;
      }
    },
    getNote(id: string) {
      return this.notes.find((note) => note.id === id)?.note;
    },
    /** Persist draft text. Updates store only after a successful save. */
    async saveNote(
      id: string,
      note: string,
      remove: boolean = false,
    ): Promise<VisitNote | undefined> {
      const authStore = useAuthStore();
      if (!authStore.isSignedIn) return;

      this.noteError = null;
      this.loadSeq += 1;
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
      } catch (error) {
        this.noteError = DEFAULT_SAVE_ERROR;
        throw error;
      } finally {
        this.savingNote = false;
      }
    },
  },
});
