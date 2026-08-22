import { describe, expect, it } from 'vitest'
import { buildParkCodeParams, buildParkSearchParams } from './searchParams'

describe('buildParkSearchParams', () => {
  it('trims the query and sets a limit', () => {
    const params = buildParkSearchParams('  rocky  ', 10)
    expect(params.get('q')).toBe('rocky')
    expect(params.get('limit')).toBe('10')
  })

  it('omits q when the query is empty', () => {
    const params = buildParkSearchParams('   ')
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
