import type { NpsListResponse, NpsPark } from '../types/nps'
import { buildParkCodeParams, buildParkSearchParams } from './searchParams'

const NPS_BASE = '/nps'

async function npsGet<T>(path: string, params: URLSearchParams): Promise<NpsListResponse<T>> {
  const url = `${NPS_BASE}${path}?${params.toString()}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`NPS request failed (${res.status}). Check NPS_API_KEY in .env and restart npm run dev.`)
  }

  return res.json() as Promise<NpsListResponse<T>>
}

export async function searchParks(query: string, limit = 20): Promise<NpsPark[]> {
  const body = await npsGet<NpsPark>('/parks', buildParkSearchParams(query, limit))
  return body.data
}

export async function getPark(parkCode: string): Promise<NpsPark | null> {
  const body = await npsGet<NpsPark>('/parks', buildParkCodeParams(parkCode))
  return body.data[0] ?? null
}
