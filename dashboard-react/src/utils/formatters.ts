/**
 * Unified formatter utilities for the Instagram dashboard.
 * All number and date formatting should use these functions
 * to ensure consistency across all views.
 *
 * Locale: id-ID
 * Timezone: Asia/Jakarta (WIB)
 */

const integerFormatter = new Intl.NumberFormat('id-ID')

const compactFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'short',
})

const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'long',
})

/**
 * Format a number with thousand separators using id-ID locale.
 * Example: 10000 → "10.000"
 * Returns "-" for null/undefined.
 */
export function formatInteger(n: number | null | undefined): string {
  if (n == null) return '-'
  return integerFormatter.format(n)
}

/**
 * Format a number in compact notation using id-ID locale.
 * Example: 10000 → "10 rb", 1200000 → "1,2 jt"
 * Returns "-" for null/undefined.
 */
export function formatCompact(n: number | null | undefined): string {
  if (n == null) return '-'
  return compactFormatter.format(n)
}

/**
 * Format a date string with Asia/Jakarta timezone and id-ID locale.
 * Example: "2024-01-15T10:00:00Z" → "15 Jan 2024"
 * Returns "-" for null/undefined/empty.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return dateFormatter.format(date)
}

/**
 * Format a date string with time, Asia/Jakarta timezone and id-ID locale.
 * Example: "2024-01-15T10:00:00Z" → "15 Jan 17.00"
 * Returns "-" for null/undefined/empty.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return dateTimeFormatter.format(date)
}

/**
 * Format a date string as short date (day + month) with Asia/Jakarta timezone.
 * Example: "2024-01-15T10:00:00Z" → "15 Jan"
 * Returns "-" for null/undefined/empty.
 */
export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return shortDateFormatter.format(date)
}

/**
 * Format Engagement Rate with 2 decimals and % suffix.
 * Example: 2.6543 → "2.65%"
 * Returns "-" for null/undefined.
 */
export function formatEngagementRate(rate: number | null | undefined): string {
  if (rate == null) return '-'
  return `${rate.toFixed(2)}%`
}

/**
 * Format a percentage with 2 decimals and % suffix (alias for general percentage values).
 * Example: 1.234 → "1.23%"
 * Returns "-" for null/undefined.
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${value.toFixed(2)}%`
}

/**
 * Format a date string as weekday name with Asia/Jakarta timezone and id-ID locale.
 * Example: "2024-01-15T10:00:00Z" → "Senin"
 * Returns "-" for null/undefined/empty.
 */
export function formatWeekday(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return weekdayFormatter.format(date)
}
