export function buildNpsSearchParams(query: string, limit = 20): URLSearchParams {
  const q = query.trim()
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  params.set('limit', String(limit))
  return params
}

export function buildParkCodeParams(parkCode: string): URLSearchParams {
  const params = new URLSearchParams()
  params.set('parkCode', parkCode.trim())
  params.set('limit', '1')
  return params
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PARK_CODE_RE = /^[a-z]{4}$/i

/** NPS id filter is case-sensitive and expects uppercase UUIDs. */
export function normalizeNpsId(id: string): string {
  const trimmed = id.trim()
  if (UUID_RE.test(trimmed)) return trimmed.toUpperCase()
  return trimmed
}

export function isNpsUuid(id: string): boolean {
  return UUID_RE.test(id.trim())
}

export function isParkCode(id: string): boolean {
  return PARK_CODE_RE.test(id.trim())
}

/** Comma-separated NPS resource ids (UUID). Uppercases UUIDs for the API. */
export function buildIdParams(ids: string[]): URLSearchParams {
  const params = new URLSearchParams()
  const normalized = ids.map(normalizeNpsId).filter(Boolean)
  params.set('id', normalized.join(','))
  params.set('limit', String(Math.max(normalized.length, 1)))
  return params
}

export function buildParkCodesParams(parkCodes: string[]): URLSearchParams {
  const params = new URLSearchParams()
  const codes = parkCodes.map((c) => c.trim().toLowerCase()).filter(Boolean)
  params.set('parkCode', codes.join(','))
  params.set('limit', String(Math.max(codes.length, 1)))
  return params
}
