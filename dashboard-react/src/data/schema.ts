import { z } from 'zod'

const metricSchema = z.object({
  followers: z.number().nullable(),
  following: z.number().nullable(),
  posts: z.number().nullable(),
  avg_likes: z.number().nullable(),
  avg_comments: z.number().nullable(),
  engagement_rate: z.number().nullable(),
}).passthrough()

export const dashboardSchema = z.object({
  generated_at: z.string(),
  generated_at_wib: z.string(),
  version: z.number(),
  sources: z.object({
    stats: z.string(),
    engagement: z.string(),
  }),
  accounts: z.array(z.string()),
  latest: z.object({
    date: z.string(),
  }).catchall(metricSchema),
  growth: z.record(z.object({
    followers_change_1d: z.number(),
    followers_change_7d: z.number(),
    pct_change_7d: z.number(),
  })),
  rankings: z.object({
    by_followers: z.array(z.object({ rank: z.number(), account: z.string(), followers: z.number() })),
    by_engagement_rate: z.array(z.object({ rank: z.number(), account: z.string(), engagement_rate: z.number() })),
  }),
  history: z.array(z.object({ date: z.string() }).passthrough()),
  // Optional real-world fields that may appear in the data source
  // Keep them optional to allow backward compatibility with older payloads
  content_breakdown: z.record(z.object({
    posts: z.number().optional(),
    total_posts_analyzed: z.number().optional(),
    reels: z.number().optional(),
    carousel: z.number().optional(),
    carousels: z.number().optional(),
    image: z.number().optional(),
    images: z.number().optional(),
    video: z.number().optional(),
    videos: z.number().optional(),
    followers: z.number().optional(),
    follower_count: z.number().optional(),
    best_post_url: z.string().optional(),
    best_post_type: z.string().optional(),
    best_post_likes: z.number().optional(),
    best_post_comments: z.number().optional(),
    best_post_timestamp: z.string().optional(),
    best_post_id: z.string().optional(),
    best_post_caption: z.string().optional(),
    bestPost: z.object({
      url: z.string().optional(),
      type: z.string().optional(),
      interactions: z.number().optional(),
      comments: z.number().optional(),
      timestamp: z.string().optional(),
      id: z.string().optional(),
      caption: z.string().optional(),
    }).optional(),
  }).passthrough()).optional(),
  post_insights: z.record(z.object({
    followers: z.number().optional(),
    posts: z.array(z.object({
      id: z.string().optional(),
      url: z.string().optional(),
      shortcode: z.string().optional(),
      timestamp: z.string().optional(),
      published_at: z.string().optional(),
      interactions: z.number().optional(),
      likes: z.number().optional(),
      comments: z.number().optional(),
      type: z.string().optional(),
      caption: z.string().optional(),
      caption_snippet: z.string().optional(),
      post_er: z.number().optional(),
      performance_label: z.string().optional(),
    }).passthrough()).optional(),
    top_interactions: z.array(z.object({}).passthrough()).optional(),
    average_likes: z.number().optional(),
    average_comments: z.number().optional(),
    average_post_er: z.number().optional(),
    dominant_type: z.string().optional(),
    top_hashtags: z.array(z.string()).optional(),
    campaign_terms: z.array(z.string()).optional(),
    viral_posts: z.number().optional(),
    underperform_posts: z.number().optional(),
  }).passthrough()).optional(),
  presentation_report: z.object({
    executiveSummary: z.object({
      kpis: z.array(z.object({ key: z.string(), label: z.string(), account: z.string().nullable(), value: z.string() })),
      bullets: z.array(z.string()),
    }),
  }),
  meta: z.object({
    brand_account: z.string().nullable().optional(),
    history_days: z.number().optional(),
  }).optional(),
})

export type DashboardApi = z.infer<typeof dashboardSchema>
