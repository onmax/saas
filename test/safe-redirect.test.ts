import { describe, expect, it } from 'vitest'
import { getSafeRedirect } from '../app/utils/safe-redirect'

describe('getSafeRedirect', () => {
  it('returns fallback for non-string', () => {
    expect(getSafeRedirect(undefined, '/app')).toBe('/app')
  })

  it('returns fallback for external URLs', () => {
    expect(getSafeRedirect('https://example.com', '/app')).toBe('/app')
  })

  it('returns fallback for protocol-relative URLs', () => {
    expect(getSafeRedirect('//example.com', '/app')).toBe('/app')
  })

  it('returns path for safe internal redirects', () => {
    expect(getSafeRedirect('/app/billing?x=1', '/app')).toBe('/app/billing?x=1')
  })
})
