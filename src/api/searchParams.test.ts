import { describe, expect, it } from 'vitest'
import {
  buildParkCodeParams,
  buildNpsSearchParams,
  buildIdParams,
  normalizeNpsId,
} from '@/api/searchParams'

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

describe('normalizeNpsId / buildIdParams', () => {
  it('uppercases UUIDs for the NPS id filter', () => {
    const id = '77e0d7f0-1942-494a-ace2-9004d2bdc59e'
    expect(normalizeNpsId(id)).toBe('77E0D7F0-1942-494A-ACE2-9004D2BDC59E')
    const params = buildIdParams([id])
    expect(params.get('id')).toBe('77E0D7F0-1942-494A-ACE2-9004D2BDC59E')
  })
})

describe('toNpsQueryString', () => {
  it('keeps literal commas in multi-id filters', async () => {
    const { toNpsQueryString } = await import('@/api/nps')
    const params = buildIdParams([
      '77e0d7f0-1942-494a-ace2-9004d2bdc59e',
      '6da17c86-088e-4b4d-b862-7c1bd5cf236b',
    ])
    const qs = toNpsQueryString(params)
    expect(qs).toContain(',')
    expect(qs).not.toMatch(/%2C/i)
  })
})
