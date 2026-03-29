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
  accounts: z.array(z.string()),
  latest: z.record(metricSchema).and(z.object({ date: z.string() })),
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
  content_breakdown: z.record(z.any()).optional(),
  post_insights: z.record(z.any()).optional(),
  presentation_report: z.object({
    executiveSummary: z.object({
      kpis: z.array(z.object({ key: z.string(), label: z.string(), account: z.string().nullable(), value: z.string() })),
      bullets: z.array(z.string()),
    }),
  }),
})

export type DashboardApi = z.infer<typeof dashboardSchema>
