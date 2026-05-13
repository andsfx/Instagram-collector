/**
 * Shared fast-check arbitraries for property-based testing.
 *
 * Provides generators for:
 * - Post entries (as consumed by the metric calculator)
 * - Account configs (as defined in config/accounts.json)
 * - Dashboard payloads (matching the schema kanonik v2)
 */
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Recognized post types in the normalized schema */
export const VALID_POST_TYPES = ['Reel', 'Carousel', 'Image', 'Video'] as const

/** Synonym post types that should be rejected by strict parser */
export const SYNONYM_POST_TYPES = ['carousel', 'image', 'video'] as const

/** Normalized content breakdown keys */
export const NORMALIZED_BREAKDOWN_KEYS = ['reels', 'carousels', 'images', 'videos', 'unknown'] as const

/** Default minimum iterations for property tests */
export const MIN_ITERATIONS = 100

/** Maximum test timeout in ms (per the 120s CI budget, individual tests get 30s) */
export const TEST_TIMEOUT_MS = 30_000

// ---------------------------------------------------------------------------
// Post Entry Arbitraries
// ---------------------------------------------------------------------------

/** A single post entry as consumed by calc-instagram-metrics.js */
export interface PostEntry {
  likes?: number | null
  comments?: number | null
  type?: string
  url?: string
  timestamp?: string
}

/** Generates a valid finite non-negative number for likes/comments */
export const arbValidLikeCount = fc.nat({ max: 1_000_000 })

/** Generates a valid finite non-negative number for comments */
export const arbValidCommentCount = fc.nat({ max: 100_000 })

/** Generates edge-case numeric values (null, NaN, Infinity, negative) */
export const arbInvalidNumeric = fc.oneof(
  fc.constant(null),
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity),
  fc.integer({ min: -1_000_000, max: -1 }),
)

/** Generates a likes value that may be valid or invalid */
export const arbMixedLikeCount = fc.oneof(
  arbValidLikeCount.map((n) => n as number | null),
  arbInvalidNumeric,
)

/** Generates a comments value that may be valid or invalid */
export const arbMixedCommentCount = fc.oneof(
  arbValidCommentCount.map((n) => n as number | null),
  arbInvalidNumeric,
)

/** Generates a recognized post type string */
export const arbValidPostType = fc.constantFrom(...VALID_POST_TYPES)

/** Generates an unrecognized post type string */
export const arbUnknownPostType = fc.constantFrom('Story', 'IGTV', 'Live', 'Guide', 'unknown_type', '')

/** Generates a post type that may be valid or unknown */
export const arbMixedPostType = fc.oneof(arbValidPostType, arbUnknownPostType)

/** Generates a valid post entry with all valid fields */
export const arbValidPostEntry: fc.Arbitrary<PostEntry> = fc.record({
  likes: arbValidLikeCount.map((n) => n as number | null),
  comments: arbValidCommentCount.map((n) => n as number | null),
  type: arbValidPostType.map((t) => t as string),
  url: fc.webUrl().map((u) => u as string | undefined),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
    .map((d) => d.toISOString()),
})

/** Generates a post entry with potentially invalid/edge-case values */
export const arbMixedPostEntry: fc.Arbitrary<PostEntry> = fc.record({
  likes: fc.option(arbMixedLikeCount, { nil: undefined }),
  comments: fc.option(arbMixedCommentCount, { nil: undefined }),
  type: fc.option(arbMixedPostType, { nil: undefined }),
  url: fc.option(fc.webUrl(), { nil: undefined }),
  timestamp: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
      .map((d) => d.toISOString()),
    { nil: undefined },
  ),
})

/** Generates a non-empty array of valid post entries */
export const arbValidPostEntries = fc.array(arbValidPostEntry, { minLength: 1, maxLength: 50 })

/** Generates an array of mixed (valid + invalid) post entries */
export const arbMixedPostEntries = fc.array(arbMixedPostEntry, { minLength: 0, maxLength: 50 })

// ---------------------------------------------------------------------------
// Account Config Arbitraries
// ---------------------------------------------------------------------------

export interface AccountConfig {
  username: string
  followers: number
  enabled: boolean
}

/** Generates a valid Instagram-like username */
export const arbUsername = fc.stringMatching(/^[a-z][a-z0-9._]{2,28}[a-z0-9]$/)

/** Generates a valid positive follower count */
export const arbValidFollowers = fc.integer({ min: 1, max: 10_000_000 })

/** Generates a followers value that may be invalid (0, negative, NaN, Infinity) */
export const arbInvalidFollowers = fc.oneof(
  fc.constant(0),
  fc.integer({ min: -1_000_000, max: -1 }),
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity),
)

/** Generates a valid account config entry */
export const arbAccountConfig: fc.Arbitrary<AccountConfig> = fc.record({
  username: arbUsername,
  followers: arbValidFollowers,
  enabled: fc.boolean(),
})

/** Generates a list of account configs with at least one enabled */
export const arbAccountConfigs = fc.array(arbAccountConfig, { minLength: 1, maxLength: 10 })
  .filter((configs) => configs.some((c) => c.enabled))

// ---------------------------------------------------------------------------
// Dashboard Payload Arbitraries
// ---------------------------------------------------------------------------

/** Generates an ISO date string (YYYY-MM-DD) */
export const arbIsoDate = fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .map((d) => d.toISOString().slice(0, 10))

/** Generates an ISO datetime string */
export const arbIsoDatetime = fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .map((d) => d.toISOString())

/** Generates a WIB datetime string (UTC+7) */
export const arbWibDatetime = fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .map((d) => {
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000)
    return wib.toISOString().replace('Z', '+07:00')
  })

/** Generates a metric entry for a single account */
export const arbMetricEntry = fc.record({
  followers: fc.option(fc.nat({ max: 10_000_000 }), { nil: null }),
  following: fc.option(fc.nat({ max: 100_000 }), { nil: null }),
  posts: fc.option(fc.nat({ max: 50_000 }), { nil: null }),
  avg_likes: fc.option(fc.nat({ max: 1_000_000 }), { nil: null }),
  avg_comments: fc.option(fc.nat({ max: 100_000 }), { nil: null }),
  engagement_rate: fc.option(
    fc.double({ min: 0, max: 100, noNaN: true }),
    { nil: null },
  ),
})

/** Generates a normalized content breakdown for a single account */
export const arbNormalizedContentBreakdown = fc.record({
  reels: fc.option(fc.nat({ max: 50 }), { nil: undefined }),
  carousels: fc.option(fc.nat({ max: 50 }), { nil: undefined }),
  images: fc.option(fc.nat({ max: 50 }), { nil: undefined }),
  videos: fc.option(fc.nat({ max: 50 }), { nil: undefined }),
  unknown: fc.option(fc.nat({ max: 10 }), { nil: undefined }),
  total_posts_analyzed: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
})

/** Generates a growth entry for a single account */
export const arbGrowthEntry = fc.record({
  followers_change_1d: fc.integer({ min: -10_000, max: 10_000 }),
  followers_change_7d: fc.integer({ min: -50_000, max: 50_000 }),
  pct_change_7d: fc.double({ min: -100, max: 100, noNaN: true }),
})

/**
 * Generates a complete valid Dashboard_Payload matching schema kanonik v2.
 * Accounts are generated consistently across all sections.
 */
export function arbDashboardPayload(accountCount?: number) {
  const count = accountCount ?? 3

  return fc.tuple(
    fc.array(arbUsername, { minLength: count, maxLength: count }),
    arbIsoDatetime,
    arbWibDatetime,
    arbIsoDate,
  ).chain(([accounts, generatedAt, generatedAtWib, latestDate]) => {
    // Ensure unique account names
    const uniqueAccounts = [...new Set(accounts)]
    if (uniqueAccounts.length < 2) {
      // Fallback to ensure we have enough accounts
      while (uniqueAccounts.length < count) {
        uniqueAccounts.push(`account_${uniqueAccounts.length}`)
      }
    }
    const accs = uniqueAccounts.slice(0, count)

    return fc.record({
      generated_at: fc.constant(generatedAt),
      generated_at_wib: fc.constant(generatedAtWib),
      version: fc.constant(2),
      sources: fc.constant({ stats: 'socialblade', engagement: 'apify' }),
      accounts: fc.constant(accs),
      latest: buildLatestArbitrary(accs, latestDate),
      growth: buildGrowthArbitrary(accs),
      rankings: buildRankingsArbitrary(accs),
      history: buildHistoryArbitrary(accs, latestDate),
      content_breakdown: buildContentBreakdownArbitrary(accs),
      presentation_report: fc.constant({
        executiveSummary: {
          kpis: [],
          bullets: [],
        },
      }),
      meta: fc.constant({
        brand_account: accs[0],
        history_days: 7,
      }),
    })
  })
}

// ---------------------------------------------------------------------------
// Internal helpers for building consistent payload sections
// ---------------------------------------------------------------------------

function buildLatestArbitrary(accounts: string[], date: string) {
  return fc.tuple(
    ...accounts.map(() => arbMetricEntry),
  ).map((metrics) => {
    const latest: Record<string, unknown> = { date }
    accounts.forEach((acc, i) => {
      latest[acc] = metrics[i]
    })
    return latest
  })
}

function buildGrowthArbitrary(accounts: string[]) {
  return fc.tuple(
    ...accounts.map(() => arbGrowthEntry),
  ).map((entries) => {
    const growth: Record<string, unknown> = {}
    accounts.forEach((acc, i) => {
      growth[acc] = entries[i]
    })
    return growth
  })
}

function buildRankingsArbitrary(accounts: string[]) {
  return fc.tuple(
    fc.shuffledSubarray(accounts, { minLength: accounts.length, maxLength: accounts.length }),
    fc.shuffledSubarray(accounts, { minLength: accounts.length, maxLength: accounts.length }),
  ).map(([byFollowers, byEr]) => ({
    by_followers: byFollowers.map((acc, i) => ({
      rank: i + 1,
      account: acc,
      followers: 100_000 - i * 10_000,
    })),
    by_engagement_rate: byEr.map((acc, i) => ({
      rank: i + 1,
      account: acc,
      engagement_rate: 5.0 - i * 0.5,
    })),
  }))
}

function buildHistoryArbitrary(accounts: string[], latestDate: string) {
  return fc.array(
    fc.tuple(arbIsoDate, ...accounts.map(() => arbMetricEntry)),
    { minLength: 1, maxLength: 7 },
  ).map((entries) => {
    // Ensure dates are unique and ascending
    const dates = entries
      .map(([date]) => date as string)
      .sort()
      .filter((d, i, arr) => i === 0 || d !== arr[i - 1])

    return dates.map((date, i) => {
      const entry: Record<string, unknown> = { date }
      accounts.forEach((acc, j) => {
        entry[acc] = entries[Math.min(i, entries.length - 1)][j + 1]
      })
      return entry
    })
  })
}

function buildContentBreakdownArbitrary(accounts: string[]) {
  return fc.tuple(
    ...accounts.map(() => arbNormalizedContentBreakdown),
  ).map((breakdowns) => {
    const result: Record<string, unknown> = {}
    accounts.forEach((acc, i) => {
      result[acc] = breakdowns[i]
    })
    return result
  })
}
