// visits store
import { nextTick } from "vue";
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { getByIds } from "@/api/nps";
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
  RESULTS_PER_PAGE,
} from "@/types/nps";

export type VisitedItem = {
  id: string;
  category: AvailableSearchCategories;
  result: NpsResult | null;
  note: string | null;
  savedOn: number | null;
};

/** Prefer auth store session — avoids auth.getUser() on every write. */
export function requireUserId(): string {
  const userId = useAuthStore().user?.id;
  if (!userId) throw new Error("Require User ID: Not signed in");
  return userId;
}

/**
 * Single upsert per write. Merges unspecified fields from the Pinia store
 * (already loaded via loadFromSupabase) so we do not SELECT-before-upsert.
 */
export async function upsertVisit(partial: VisitUpsert): Promise<VisitRow> {
  const userId = requireUserId();
  const visitsStore = useVisitsStore();
  const existingNote = visitsStore.notes.find(
    (entry) => entry.id === partial.item_id,
  );

  const row = {
    user_id: userId,
    item_id: partial.item_id,
    category:
      partial.category !== undefined
        ? partial.category
        : (visitsStore.categories[partial.item_id] ?? null),
    visited:
      partial.visited ?? visitsStore.visited.includes(partial.item_id),
    note:
      partial.note !== undefined ? partial.note : (existingNote?.note ?? null),
    saved_on:
      partial.saved_on !== undefined
        ? partial.saved_on
        : existingNote?.savedOn != null
          ? new Date(existingNote.savedOn).toISOString()
          : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("visits")
    .upsert(row, { onConflict: "user_id,item_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchVisits(): Promise<VisitRow[]> {
  const visitsStore = useVisitsStore();
  visitsStore.loading = true;
  visitsStore.fetchError = null;
  try {
    const userId = requireUserId();
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
     * Seeds from itemCache / existing visitedItems first (immediate paint),
     * fetches only missing ids, and hydrates the first page before the rest.
     */
    async loadVisitedDetails() {
      if (this.visited.length === 0) {
        this.visitedItems = [];
        return;
      }

      const searchStore = useSearchStore();
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
        resultsById.set(id, result);
        for (const key of [result.id, result.parkCode]) {
          if (!key) continue;
          resultsById.set(key, result);
          resultsById.set(key.toLowerCase(), result);
          resultsById.set(key.toUpperCase(), result);
        }
      };

      const lookupResult = (id: string) =>
        resultsById.get(id) ??
        resultsById.get(id.toLowerCase()) ??
        resultsById.get(id.toUpperCase()) ??
        null;

      const paintVisitedItems = () => {
        this.visitedItems = this.visited.map((id) => {
          const noteEntry = this.notes.find((note) => note.id === id);
          const prev = this.visitedItems.find((item) => item.id === id);
          return {
            id,
            category:
              categoryById[id] ??
              prev?.category ??
              AVAILABLE_SEARCH_CATEGORIES.PARKS,
            result: lookupResult(id) ?? prev?.result ?? null,
            note: noteEntry?.note ?? null,
            savedOn: noteEntry?.savedOn ?? null,
          };
        });
      };

      // Seed from prior Field Log rows + search/detail cache (no network).
      for (const id of this.visited) {
        if (lookupResult(id)) continue;
        const prev = this.visitedItems.find((item) => item.id === id)?.result;
        const cached = prev ?? searchStore.findById(id);
        if (!cached) continue;
        setResult(
          id,
          cached,
          categoryById[id] ?? AVAILABLE_SEARCH_CATEGORIES.PARKS,
        );
      }
      paintVisitedItems();

      const missing = this.visited.filter((id) => !lookupResult(id));
      if (missing.length === 0) {
        searchStore.cacheResults(
          this.visitedItems
            .map((item) => item.result)
            .filter((result): result is NpsResult => result != null),
        );
        return;
      }

      // Let the seeded list paint before NPS round-trips.
      await nextTick();

      const fetchIds = async (ids: string[]) => {
        if (ids.length === 0) return;

        const byCategory = new Map<AvailableSearchCategories, string[]>();
        const withoutCategory: string[] = [];

        for (const id of ids) {
          const category = categoryById[id];
          if (!category) {
            withoutCategory.push(id);
            continue;
          }
          const list = byCategory.get(category) ?? [];
          list.push(id);
          byCategory.set(category, list);
        }

        await Promise.all(
          [...byCategory.entries()].map(async ([category, categoryIds]) => {
            const results = await getByIds(category, categoryIds);
            for (const id of categoryIds) {
              const result = results.find(
                (row) =>
                  row.id?.toLowerCase() === id.toLowerCase() ||
                  row.parkCode?.toLowerCase() === id.toLowerCase(),
              );
              if (result) setResult(id, result, category);
            }
          }),
        );

        // Uncategorized leftovers: one parks batch (most common). No per-id
        // resolveNpsItem and no hydration upserts — category is written on visit.
        const stillMissing = withoutCategory.filter((id) => !lookupResult(id));
        if (stillMissing.length === 0) return;

        const results = await getByIds(
          AVAILABLE_SEARCH_CATEGORIES.PARKS,
          stillMissing,
        );
        for (const id of stillMissing) {
          const result = results.find(
            (row) =>
              row.id?.toLowerCase() === id.toLowerCase() ||
              row.parkCode?.toLowerCase() === id.toLowerCase(),
          );
          if (result) {
            setResult(id, result, AVAILABLE_SEARCH_CATEGORIES.PARKS);
          }
        }
      };

      this.detailsLoading = true;
      this.fetchError = null;
      try {
        const priority = missing.slice(0, RESULTS_PER_PAGE);
        const deferred = missing.slice(RESULTS_PER_PAGE);

        await fetchIds(priority);
        paintVisitedItems();

        if (deferred.length > 0) {
          await fetchIds(deferred);
          paintVisitedItems();
        }

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
