import { describe, expect, it } from 'vitest'
import { buildParkCodeParams, buildNpsSearchParams } from '@/api/searchParams'

describe('buildNpsSearchParams', () => {
  it('trims the query and sets a limit', () => {
    const params = buildNpsSearchParams('  rocky  ', 10)
    expect(params.get('q')).toBe('rocky')
    expect(params.get('limit')).toBe('10')
  })

  it('omits q when the query is empty', () => {
    const params = buildNpsSearchParams('   ')
    expect(params.get('q')).toBeNull()
    expect(params.get('limit')).toBe('20')
  })
})

describe('buildParkCodeParams', () => {
  it('sets parkCode', () => {
    const params = buildParkCodeParams('romo')
    expect(params.get('parkCode')).toBe('romo')
    expect(params.get('limit')).toBe('1')
  })
})
