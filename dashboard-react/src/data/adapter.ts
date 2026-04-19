import type { DashboardApi } from './schema'
import type {
  ContentBreakdownAccountShape,
  ContentBreakdownByAccount,
  DashboardRecord,
  MetricEntry,
  PostInsightsByAccount,
  PostInsightsAccountShape,
  PostInsightPost,
} from './types'

function assertLatestMetricEntry(input: DashboardApi, account: string): MetricEntry {
  const latestEntry = input.latest?.[account]

  if (!latestEntry) {
    throw new Error(`Dashboard payload tidak valid: latest.${account} tidak tersedia`)
  }

  return latestEntry as MetricEntry
}

/** Safely extract a number or return undefined */
function num(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

/** Safely extract a string or return undefined */
function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function adaptContentBreakdown(input: DashboardApi): ContentBreakdownByAccount {
  const raw = input.content_breakdown
  if (!raw) return {}

  return Object.fromEntries(
    input.accounts.map((acc) => {
      const cb = raw[acc] as Record<string, unknown> | undefined
      if (!cb) return [acc, undefined]

      const shaped: ContentBreakdownAccountShape = {
        posts: num(cb.posts) ?? num(cb.total_posts_analyzed),
        reels: num(cb.reels),
        carousels: num(cb.carousels) ?? num(cb.carousel),
        images: num(cb.images) ?? num(cb.image),
        videos: num(cb.videos) ?? num(cb.video),
        followers: num(cb.followers) ?? num(cb.follower_count),
        bestPost: {
          url: str(cb.best_post_url) ?? str((cb.bestPost as Record<string, unknown> | undefined)?.url),
          type: str(cb.best_post_type) ?? str((cb.bestPost as Record<string, unknown> | undefined)?.type),
          interactions: num(cb.best_post_likes) ?? num((cb.bestPost as Record<string, unknown> | undefined)?.interactions),
          comments: num(cb.best_post_comments) ?? num((cb.bestPost as Record<string, unknown> | undefined)?.comments),
          timestamp: str(cb.best_post_timestamp) ?? str((cb.bestPost as Record<string, unknown> | undefined)?.timestamp),
          id: str(cb.best_post_id) ?? str((cb.bestPost as Record<string, unknown> | undefined)?.id),
          caption: str(cb.best_post_caption) ?? str((cb.bestPost as Record<string, unknown> | undefined)?.caption),
        },
      }

      return [acc, shaped]
    }),
  )
}

function adaptPostInsights(input: DashboardApi): PostInsightsByAccount {
  const raw = input.post_insights
  if (!raw) return {}

  return Object.fromEntries(
    input.accounts.map((acc) => {
      const pi = raw[acc] as Record<string, unknown> | undefined
      if (!pi) return [acc, undefined]

      const shaped: PostInsightsAccountShape = {
        followers: num(pi.followers),
        posts: Array.isArray(pi.posts) ? (pi.posts as PostInsightPost[]) : undefined,
        top_interactions: Array.isArray(pi.top_interactions) ? (pi.top_interactions as PostInsightPost[]) : undefined,
        average_likes: num(pi.average_likes),
        average_comments: num(pi.average_comments),
        average_post_er: num(pi.average_post_er),
        dominant_type: str(pi.dominant_type),
        top_hashtags: Array.isArray(pi.top_hashtags) ? (pi.top_hashtags as string[]) : undefined,
        campaign_terms: Array.isArray(pi.campaign_terms) ? (pi.campaign_terms as string[]) : undefined,
        viral_posts: num(pi.viral_posts),
        underperform_posts: num(pi.underperform_posts),
      }

      return [acc, shaped]
    }),
  )
}

export function adaptDashboardData(input: DashboardApi): DashboardRecord {
  const latestEntries: Record<string, MetricEntry> = Object.fromEntries(
    input.accounts.map((account) => {
      return [account, assertLatestMetricEntry(input, account)]
    }),
  )

  const history = input.history.map((row) => ({
    date: row.date,
    values: Object.fromEntries(
      input.accounts.map((account) => {
        const entry = (row as Record<string, unknown>)[account]
        // Safely coerce history row entries to MetricEntry shape
        if (entry && typeof entry === 'object') {
          return [account, entry as MetricEntry]
        }
        return [account, { followers: null, following: null, posts: null, avg_likes: null, avg_comments: null, engagement_rate: null } satisfies MetricEntry]
      }),
    ),
  }))

  return {
    generatedAt: input.generated_at,
    generatedAtWib: input.generated_at_wib,
    version: input.version,
    sources: input.sources,
    latestDate: input.latest.date,
    accounts: input.accounts,
    latest: latestEntries,
    growth: input.growth,
    rankings: input.rankings,
    presentation: {
      executiveKpis: input.presentation_report.executiveSummary.kpis,
      executiveBullets: input.presentation_report.executiveSummary.bullets,
    },
    meta: {
      brandAccount: input.meta?.brand_account ?? input.accounts[0] ?? null,
      historyDays: input.meta?.history_days,
    },
    history,
    content_breakdown: adaptContentBreakdown(input),
    post_insights: adaptPostInsights(input),
  }
}
