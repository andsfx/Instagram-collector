import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { classifyFreshness } from './FreshnessMonitor'

describe('classifyFreshness', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-20T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "fresh" when age ≤ 24h', () => {
    // 12 hours ago
    const generatedAt = '2025-01-20T00:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('fresh')
  })

  it('returns "fresh" at exactly 24h boundary', () => {
    // Exactly 24 hours ago (86400 seconds)
    const generatedAt = '2025-01-19T12:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('fresh')
  })

  it('returns "stale" when age is between 24h and 48h', () => {
    // 36 hours ago
    const generatedAt = '2025-01-19T00:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('stale')
  })

  it('returns "stale" at exactly 48h boundary', () => {
    // Exactly 48 hours ago (172800 seconds)
    const generatedAt = '2025-01-18T12:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('stale')
  })

  it('returns "critical" when age > 48h', () => {
    // 72 hours ago
    const generatedAt = '2025-01-17T12:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('critical')
  })

  it('returns "critical" just past 48h boundary', () => {
    // 48h + 1 second ago
    const generatedAt = '2025-01-18T11:59:59Z'
    expect(classifyFreshness(generatedAt)).toBe('critical')
  })

  it('returns "unavailable" when generatedAt is null', () => {
    expect(classifyFreshness(null)).toBe('unavailable')
  })

  it('returns "unavailable" when generatedAt is invalid date string', () => {
    expect(classifyFreshness('not-a-date')).toBe('unavailable')
  })

  it('returns "unavailable" when generatedAt is empty string', () => {
    expect(classifyFreshness('')).toBe('unavailable')
  })

  it('returns "fresh" when generatedAt is in the future', () => {
    // Future timestamp (negative age)
    const generatedAt = '2025-01-21T00:00:00Z'
    expect(classifyFreshness(generatedAt)).toBe('fresh')
  })
})
