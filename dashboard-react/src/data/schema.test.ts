import { describe, expect, it } from 'vitest'
import {
  dashboardSchema,
  parsePayload,
  SUPPORTED_VERSIONS,
  type ParseResult,
  type ValidationError,
} from './schema'

// ---------------------------------------------------------------------------
// Helper: minimal valid payload
// ---------------------------------------------------------------------------

function createValidPayload() {
  return {
    generated_at: '2025-01-15T10:00:00.000Z',
    generated_at_wib: '2025-01-15T17:00:00.000+07:00',
    version: 2,
    sources: { stats: 'socialblade', engagement: 'apify' },
    accounts: ['testaccount'],
    latest: {
      date: '2025-01-15',
      testaccount: {
        followers: 10000,
        following: 500,
        posts: 120,
        avg_likes: 250,
        avg_comments: 15,
        engagement_rate: 2.65,
      },
    },
    growth: {
      testaccount: {
        followers_change_1d: 50,
        followers_change_7d: 300,
        pct_change_7d: 3.1,
      },
    },
    rankings: {
      by_followers: [{ rank: 1, account: 'testaccount', followers: 10000 }],
      by_engagement_rate: [{ rank: 1, account: 'testaccount', engagement_rate: 2.65 }],
    },
    history: [{ date: '2025-01-14', testaccount: { followers: 9950 } }],
    content_breakdown: {
      testaccount: {
        reels: 5,
        carousels: 3,
        images: 2,
        videos: 1,
        unknown: 1,
        total_posts_analyzed: 12,
      },
    },
    presentation_report: {
      executiveSummary: {
        kpis: [{ key: 'followers', label: 'Followers', account: 'testaccount', value: '10,000' }],
        bullets: ['Growth is steady'],
      },
    },
    meta: { brand_account: 'testaccount', history_days: 7 },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SUPPORTED_VERSIONS', () => {
  it('contains version 2', () => {
    expect(SUPPORTED_VERSIONS).toContain(2)
  })
})

describe('dashboardSchema strict content_breakdown', () => {
  it('accepts normalized field names (carousels, images, videos, unknown)', () => {
    const payload = createValidPayload()
    const result = dashboardSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })

  it('rejects synonym "carousel" in content_breakdown', () => {
    const payload = createValidPayload()
    payload.content_breakdown = {
      testaccount: {
        reels: 5,
        carousel: 3,  // synonym - should be rejected
        images: 2,
        videos: 1,
        unknown: 0,
      } as any,
    }
    const result = dashboardSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('rejects synonym "image" in content_breakdown', () => {
    const payload = createValidPayload()
    payload.content_breakdown = {
      testaccount: {
        reels: 5,
        carousels: 3,
        image: 2,  // synonym - should be rejected
        videos: 1,
        unknown: 0,
      } as any,
    }
    const result = dashboardSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('rejects synonym "video" in content_breakdown', () => {
    const payload = createValidPayload()
    payload.content_breakdown = {
      testaccount: {
        reels: 5,
        carousels: 3,
        images: 2,
        video: 1,  // synonym - should be rejected
        unknown: 0,
      } as any,
    }
    const result = dashboardSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('rejects arbitrary unknown fields in content_breakdown', () => {
    const payload = createValidPayload()
    payload.content_breakdown = {
      testaccount: {
        reels: 5,
        carousels: 3,
        images: 2,
        videos: 1,
        unknown: 0,
        some_random_field: 42,
      } as any,
    }
    const result = dashboardSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

describe('version validation', () => {
  it('accepts version 2', () => {
    const payload = createValidPayload()
    const result = parsePayload(payload)
    expect(result.success).toBe(true)
  })

  it('rejects unsupported version (e.g. version 1)', () => {
    const payload = createValidPayload()
    payload.version = 1
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].path).toBe('version')
      expect(result.errors[0].message).toContain('Supported versions')
    }
  })

  it('rejects unsupported version (e.g. version 99)', () => {
    const payload = createValidPayload()
    payload.version = 99
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors[0].path).toBe('version')
    }
  })
})

describe('parsePayload', () => {
  it('returns success with data for valid payload', () => {
    const payload = createValidPayload()
    const result = parsePayload(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.version).toBe(2)
      expect(result.data.accounts).toEqual(['testaccount'])
    }
  })

  it('returns failure with errors for missing required field', () => {
    const payload = createValidPayload()
    delete (payload as any).generated_at
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].path).toBe('generated_at')
      expect(result.errors[0].code).toBeTruthy()
      expect(result.errors[0].message).toBeTruthy()
    }
  })

  it('returns failure with dot-path for nested field errors', () => {
    const payload = createValidPayload()
    payload.content_breakdown = {
      testaccount: {
        reels: 5,
        carousels: 3,
        images: 2,
        videos: 1,
        unknown: 0,
        follower_count: 999,  // not allowed in strict mode
      } as any,
    }
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      const pathError = result.errors.find((e) => e.path.includes('content_breakdown'))
      expect(pathError).toBeDefined()
      expect(pathError!.path).toContain('testaccount')
    }
  })

  it('returns failure for invalid type in field', () => {
    const payload = createValidPayload()
    ;(payload as any).accounts = 'not-an-array'
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors[0].path).toBe('accounts')
      expect(result.errors[0].code).toBe('invalid_type')
    }
  })

  it('returns multiple errors when multiple fields are invalid', () => {
    const payload = createValidPayload()
    delete (payload as any).generated_at
    delete (payload as any).generated_at_wib
    const result = parsePayload(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('formats root-level path correctly', () => {
    const result = parsePayload(null)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })
})
