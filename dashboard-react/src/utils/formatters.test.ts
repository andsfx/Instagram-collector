import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatEngagementRate,
  formatInteger,
  formatPercent,
  formatShortDate,
} from './formatters'

describe('formatInteger', () => {
  it('formats numbers with thousand separators (id-ID locale)', () => {
    const result = formatInteger(10000)
    // id-ID uses dot as thousand separator
    expect(result).toContain('10')
    expect(result).not.toBe('10000')
  })

  it('returns "-" for null', () => {
    expect(formatInteger(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatInteger(undefined)).toBe('-')
  })

  it('formats zero', () => {
    expect(formatInteger(0)).toBe('0')
  })

  it('formats negative numbers', () => {
    const result = formatInteger(-5000)
    expect(result).toContain('5')
    expect(result).toContain('-')
  })
})

describe('formatCompact', () => {
  it('formats large numbers in compact notation', () => {
    const result = formatCompact(1200000)
    // Should be something like "1,2 jt" in id-ID
    expect(result).not.toBe('1200000')
    expect(result.length).toBeLessThan(10)
  })

  it('returns "-" for null', () => {
    expect(formatCompact(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatCompact(undefined)).toBe('-')
  })

  it('formats zero', () => {
    expect(formatCompact(0)).toBe('0')
  })
})

describe('formatDate', () => {
  it('formats a date string with Asia/Jakarta timezone', () => {
    const result = formatDate('2024-01-15T10:00:00Z')
    // Should contain day, month, year in id-ID format
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('returns "-" for empty string', () => {
    expect(formatDate('')).toBe('-')
  })

  it('returns "-" for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('formats a date string with time', () => {
    const result = formatDateTime('2024-01-15T10:00:00Z')
    expect(result).toContain('15')
  })

  it('returns "-" for null', () => {
    expect(formatDateTime(null)).toBe('-')
  })

  it('returns "-" for invalid date', () => {
    expect(formatDateTime('invalid')).toBe('-')
  })
})

describe('formatShortDate', () => {
  it('formats a date as short date (day + month)', () => {
    const result = formatShortDate('2024-01-15T10:00:00Z')
    expect(result).toContain('15')
  })

  it('returns "-" for null', () => {
    expect(formatShortDate(null)).toBe('-')
  })

  it('returns "-" for empty string', () => {
    expect(formatShortDate('')).toBe('-')
  })
})

describe('formatEngagementRate', () => {
  it('formats with 2 decimals and % suffix', () => {
    expect(formatEngagementRate(2.6543)).toBe('2.65%')
  })

  it('formats zero', () => {
    expect(formatEngagementRate(0)).toBe('0.00%')
  })

  it('formats with rounding', () => {
    expect(formatEngagementRate(1.006)).toBe('1.01%')
  })

  it('returns "-" for null', () => {
    expect(formatEngagementRate(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatEngagementRate(undefined)).toBe('-')
  })
})

describe('formatPercent', () => {
  it('formats with 2 decimals and % suffix', () => {
    expect(formatPercent(3.14159)).toBe('3.14%')
  })

  it('returns "-" for null', () => {
    expect(formatPercent(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatPercent(undefined)).toBe('-')
  })
})
