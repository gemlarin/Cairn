import type {
  AvailableSearchCategories,
  NpsListResponse,
  NpsResult,
} from "@/types/nps";
import { buildParkCodeParams, buildNpsSearchParams } from "@/api/searchParams";

const NPS_BASE = "/nps";

async function npsGet<T>(
  path: string,
  params: URLSearchParams,
): Promise<NpsListResponse<T>> {
  const url = `${NPS_BASE}${path}?${params.toString()}`;
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
