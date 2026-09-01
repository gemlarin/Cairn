import type {
  AvailableSearchCategories,
  NpsListResponse,
  NpsResult,
} from "@/types/nps";
import { AVAILABLE_SEARCH_CATEGORIES } from "@/types/nps";
import {
  buildParkCodeParams,
  buildParkCodesParams,
  buildNpsSearchParams,
  buildIdParams,
  isNpsUuid,
  isParkCode,
  normalizeNpsId,
} from "@/api/searchParams";

const NPS_BASE = "/nps";

const ALL_CATEGORIES = Object.values(AVAILABLE_SEARCH_CATEGORIES);

/**
 * NPS multi-value `id` / `parkCode` filters require literal commas.
 * URLSearchParams encodes them as %2C, which the API treats as one id
 * and only returns the first match — Field Log then shows "Unknown".
 */
export function toNpsQueryString(params: URLSearchParams): string {
  return params.toString().replace(/%2C/gi, ",");
}

async function npsGet<T>(
  path: string,
  params: URLSearchParams,
): Promise<NpsListResponse<T>> {
  const url = `${NPS_BASE}${path}?${toNpsQueryString(params)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `NPS request failed (${res.status}). Check NPS_API_KEY in .env and restart npm run dev.`,
    );
  }

  return res.json() as Promise<NpsListResponse<T>>;
}

export async function searchNPS(
  query: string,
  numberOfResults: number,
  searchCategory: AvailableSearchCategories,
): Promise<NpsResult[]> {
  const body = await npsGet<NpsResult>(
    `/${searchCategory}`,
    buildNpsSearchParams(query, numberOfResults),
  );
  return body.data;
}

export async function getPark(parkCode: string): Promise<NpsResult | null> {
  const body = await npsGet<NpsResult>("/parks", buildParkCodeParams(parkCode));
  return body.data[0] ?? null;
}

function idsMatch(requestedId: string, result: NpsResult): boolean {
  const want = new Set([
    requestedId,
    requestedId.toLowerCase(),
    requestedId.toUpperCase(),
    normalizeNpsId(requestedId),
  ]);
  for (const key of [result.id, result.parkCode]) {
    if (!key) continue;
    if (
      want.has(key) ||
      want.has(key.toLowerCase()) ||
      want.has(key.toUpperCase())
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Fetch NPS items by id (UUID) and/or parkCode.
 * NPS ignores invalid `id` filters and returns arbitrary parks — we only keep
 * rows that match a requested id/parkCode (case-insensitive).
 */
export async function getByIds(
  category: AvailableSearchCategories,
  ids: string[],
): Promise<NpsResult[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const uuids = unique.filter(isNpsUuid);
  const parkCodes =
    category === AVAILABLE_SEARCH_CATEGORIES.PARKS
      ? unique.filter(isParkCode)
      : [];

  const batches: Promise<NpsResult[]>[] = [];

  if (uuids.length > 0) {
    batches.push(
      npsGet<NpsResult>(`/${category}`, buildIdParams(uuids)).then(
        (body) => body.data,
      ),
    );
  }
  if (parkCodes.length > 0) {
    batches.push(
      npsGet<NpsResult>("/parks", buildParkCodesParams(parkCodes)).then(
        (body) => body.data,
      ),
    );
  }

  if (batches.length === 0) return [];

  const chunks = await Promise.all(batches);
  const matched: NpsResult[] = [];
  const seen = new Set<string>();

  for (const result of chunks.flat()) {
    const hit = unique.some((id) => idsMatch(id, result));
    if (!hit) continue;
    const dedupe = result.id || result.parkCode;
    if (!dedupe || seen.has(dedupe)) continue;
    seen.add(dedupe);
    matched.push(result);
  }
  return matched;
}

export async function getById(
  category: AvailableSearchCategories,
  id: string,
): Promise<NpsResult | null> {
  const results = await getByIds(category, [id]);
  return results[0] ?? null;
}

/** Try hint category first, then every NPS list endpoint until one matches. */
export async function resolveNpsItem(
  id: string,
  categoryHint?: AvailableSearchCategories | null,
): Promise<{ result: NpsResult; category: AvailableSearchCategories } | null> {
  const ordered = [
    ...(categoryHint ? [categoryHint] : []),
    ...ALL_CATEGORIES.filter((c) => c !== categoryHint),
  ];

  for (const category of ordered) {
    const result = await getById(category, id);
    if (result) return { result, category };
  }
  return null;
}
