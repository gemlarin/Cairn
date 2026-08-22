export function buildParkSearchParams(query: string, limit = 20): URLSearchParams {
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
