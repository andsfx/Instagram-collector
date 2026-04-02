export type AccountKey = string

export interface MetricEntry {
  followers: number | null
  following: number | null
  posts: number | null
  avg_likes: number | null
  avg_comments: number | null
  engagement_rate: number | null
}

export interface GrowthEntry {
  followers_change_1d: number
  followers_change_7d: number
  pct_change_7d: number
}

export interface DashboardRecord {
  generatedAt: string
  generatedAtWib: string
  version: number
  sources: {
    stats: string
    engagement: string
  }
  latestDate: string
  accounts: AccountKey[]
  latest: Record<AccountKey, MetricEntry>
  growth: Record<AccountKey, GrowthEntry>
  rankings: {
    by_followers: Array<{ rank: number; account: AccountKey; followers: number }>
    by_engagement_rate: Array<{ rank: number; account: AccountKey; engagement_rate: number }>
  }
  presentation: {
    executiveKpis: Array<{ key: string; label: string; account: string | null; value: string }>
    executiveBullets: string[]
  }
  history: Array<{ date: string; values: Record<AccountKey, MetricEntry> }>
  // Optional audited breakdowns from schema
  content_breakdown?: ContentBreakdownByAccount
  post_insights?: PostInsightsByAccount
}

export interface UiAccountSummary {
  key: AccountKey
  name: string
  followers: number
  following: number
  posts: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  change1d: number
  change7d: number
  change7dPct: number
}

// New shapes for audited content breakdown and post insights data
export interface ContentBreakdownAccountShape {
  posts?: number
  reels?: number
  carousels?: number
  images?: number
  videos?: number
  followers?: number
  // Optional best post reference within this breakdown
  bestPost?: {
    url?: string
    type?: string
    interactions?: number
    comments?: number
    timestamp?: string
    // Backwards-compat alias
    id?: string
    caption?: string
  }
}

export interface ContentBreakdownByAccount {
  [account: string]: ContentBreakdownAccountShape | undefined
}

export interface PostInsightPost {
  id?: string
  url?: string
  shortcode?: string
  timestamp?: string
  published_at?: string
  interactions?: number
  likes?: number
  comments?: number
  type?: string
  caption?: string
}

export interface PostInsightsAccountShape {
  followers?: number
  posts?: PostInsightPost[]
  top_interactions?: PostInsightPost[]
}

export interface PostInsightsByAccount {
  [account: string]: PostInsightsAccountShape | undefined
}
