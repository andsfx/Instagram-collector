import type { DashboardApi } from './schema'
import type { DashboardRecord, MetricEntry } from './types'

type AccountKey = string

export function adaptDashboardData(input: DashboardApi): DashboardRecord {
  // Build latest entries with robust fallbacks to support real-world payloads
  const latestEntries: Record<AccountKey, MetricEntry> = Object.fromEntries(
    input.accounts.map((account) => {
      // Try primary source
      const primary = (input.latest?.[account] ?? null) as MetricEntry | null
      if (primary) return [account, primary]
      // Fallbacks from alternative, possibly snake_case fields
      const cb = (input as any).content_breakdown?.[account] as any
      if (cb) return [account, cb as MetricEntry]
      const pi = (input as any).post_insights?.[account] as any
      if (pi) return [account, pi as MetricEntry]
      // Default empty metric to keep shape stable
      const empty: any = {
        followers: null,
        following: null,
        posts: null,
        avg_likes: null,
        avg_comments: null,
        engagement_rate: null,
      }
      return [account, empty as MetricEntry]
    }),
  )

  const history = input.history.map((row) => ({
    date: row.date,
    values: Object.fromEntries(
      input.accounts.map((account) => [account, (row as any)[account] as MetricEntry]),
    ),
  }))

  // Build audited content_breakdown and post_insights shapes if present
  const content_breakdown: any = Object.fromEntries(
    input.accounts.map((acc) => {
      const cb = (input as any).content_breakdown?.[acc]
      if (cb) {
        // Normalize to our ContentBreakdownByAccount shape as a minimal object
        const shaped: any = {
          posts: cb?.posts ?? cb?.total_posts_analyzed ?? undefined,
          reels: cb?.reels ?? undefined,
          carousels: cb?.carousels ?? cb?.carousel ?? undefined,
          images: cb?.images ?? cb?.image ?? undefined,
          videos: cb?.videos ?? cb?.video ?? undefined,
          followers: cb?.followers ?? cb?.follower_count ?? undefined,
        }
        // Normalize best post information from both modern and legacy field names
        shaped.bestPost = {
          url: cb?.best_post_url ?? cb?.bestPost?.url ?? undefined,
          type: cb?.best_post_type ?? cb?.bestPost?.type ?? undefined,
          interactions: cb?.best_post_likes ?? cb?.bestPost?.interactions ?? undefined,
          comments: cb?.best_post_comments ?? cb?.bestPost?.comments ?? undefined,
          timestamp: cb?.best_post_timestamp ?? cb?.bestPost?.timestamp ?? undefined,
          id: cb?.best_post_id ?? cb?.bestPost?.id ?? undefined,
          caption: cb?.best_post_caption ?? cb?.bestPost?.caption ?? undefined,
        }
        // If there is no meaningful data, still return an object to preserve shape
        return [acc, shaped]
      }
      return [acc, undefined]
    }),
  )

  const post_insights: any = Object.fromEntries(
    input.accounts.map((acc) => {
      const pi = (input as any).post_insights?.[acc]
      if (pi) {
        const shaped: any = {
          followers: pi?.followers ?? undefined,
          posts: Array.isArray(pi?.posts) ? pi.posts : undefined,
          top_interactions: Array.isArray(pi?.top_interactions) ? pi.top_interactions : undefined,
        }
        return [acc, shaped]
      }
      return [acc, undefined]
    }),
  )

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
    history,
    content_breakdown: content_breakdown as any,
    post_insights: post_insights as any,
  }
}
