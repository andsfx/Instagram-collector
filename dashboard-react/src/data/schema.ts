import { z } from 'zod'

// ---------------------------------------------------------------------------
// Version Support
// ---------------------------------------------------------------------------

/** Supported schema versions. Payloads with other versions are rejected. */
export const SUPPORTED_VERSIONS = [2] as const

// ---------------------------------------------------------------------------
// Interfaces for Parse Results
// ---------------------------------------------------------------------------

/** A validation error with dot-path location and human-readable reason */
export interface ValidationError {
  /** Dot-path notation to the failing field, e.g. "content_breakdown.metmalbekasi.carousel" */
  path: string
  /** Human-readable description of why validation failed */
  message: string
  /** Machine-readable error code (e.g. "unrecognized_keys", "invalid_type") */
  code: string
}

/** Discriminated union result from parsePayload */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

const metricSchema = z.object({
  followers: z.number().nullable(),
  following: z.number().nullable(),
  posts: z.number().nullable(),
  avg_likes: z.number().nullable(),
  avg_comments: z.number().nullable(),
  engagement_rate: z.number().nullable(),
}).passthrough()

/**
 * Content breakdown schema for a single account.
 * Accepts both normalized names (carousels, images, videos) and legacy names
 * (carousel, image, video) via passthrough — adapter handles normalization.
 */
const strictContentBreakdownAccountSchema = z.object({
  reels: z.number().optional(),
  carousels: z.number().optional(),
  images: z.number().optional(),
  videos: z.number().optional(),
  unknown: z.number().optional(),
  total_posts_analyzed: z.number().optional(),
  posts: z.number().optional(),
  followers: z.number().optional(),
  bestPost: z.object({
    url: z.string().optional(),
    type: z.string().optional(),
    interactions: z.number().optional(),
    comments: z.number().optional(),
    timestamp: z.string().optional(),
    id: z.string().optional(),
    caption: z.string().optional(),
  }).optional(),
}).passthrough()  // Allow legacy field names — adapter normalizes

// ---------------------------------------------------------------------------
// Dashboard Schema v2 (Strict)
// ---------------------------------------------------------------------------

export const dashboardSchema = z.object({
  generated_at: z.string(),
  generated_at_wib: z.string(),
  version: z.number().refine(
    (v) => (SUPPORTED_VERSIONS as readonly number[]).includes(v),
    { message: `Unsupported version. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}` },
  ),
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
  }).passthrough()),
  rankings: z.object({
    by_followers: z.array(z.object({ rank: z.number(), account: z.string(), followers: z.number() })),
    by_engagement_rate: z.array(z.object({ rank: z.number(), account: z.string(), engagement_rate: z.number() })),
  }).passthrough(),
  history: z.array(z.object({ date: z.string() }).passthrough()),
  content_breakdown: z.record(strictContentBreakdownAccountSchema).optional(),
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

// ---------------------------------------------------------------------------
// Payload Parser
// ---------------------------------------------------------------------------

/**
 * Convert a Zod issue path array to dot-path notation string.
 * e.g. ["content_breakdown", "metmalbekasi", "carousel"] → "content_breakdown.metmalbekasi.carousel"
 */
function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return '(root)'
  return path.map((segment) => String(segment)).join('.')
}

/**
 * Parse and validate a raw JSON payload against the strict v2 dashboard schema.
 *
 * Returns a discriminated union:
 * - On success: `{ success: true, data: DashboardApi }`
 * - On failure: `{ success: false, errors: ValidationError[] }` with dot-path error reporting
 */
export function parsePayload(payload: unknown): ParseResult<DashboardApi> {
  const result = dashboardSchema.safeParse(payload)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: formatPath(issue.path),
    message: issue.message,
    code: issue.code,
  }))

  return { success: false, errors }
}
