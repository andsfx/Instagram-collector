import { describe, expect, it } from 'vitest'
import { adaptDashboardData } from './adapter'
import { dashboardSchema } from './schema'

function createPayload() {
  return dashboardSchema.parse({
    generated_at: '2026-04-13T00:00:00Z',
    generated_at_wib: '2026-04-13T07:00:00+07:00',
    version: 2,
    sources: {
      stats: 'socialblade',
      engagement: 'apify',
    },
    accounts: ['metmalbekasi', 'grandmetropolitan'],
    latest: {
      date: '2026-04-13',
      metmalbekasi: {
        followers: 100,
        following: 10,
        posts: 20,
        avg_likes: 30,
        avg_comments: 4,
        engagement_rate: 1.2,
      },
      grandmetropolitan: {
        followers: 90,
        following: 9,
        posts: 15,
        avg_likes: 20,
        avg_comments: 2,
        engagement_rate: 0.9,
      },
    },
    growth: {
      metmalbekasi: {
        followers_change_1d: 1,
        followers_change_7d: 7,
        pct_change_7d: 7,
      },
      grandmetropolitan: {
        followers_change_1d: 2,
        followers_change_7d: 5,
        pct_change_7d: 5,
      },
    },
    rankings: {
      by_followers: [
        { rank: 1, account: 'metmalbekasi', followers: 100 },
        { rank: 2, account: 'grandmetropolitan', followers: 90 },
      ],
      by_engagement_rate: [
        { rank: 1, account: 'metmalbekasi', engagement_rate: 1.2 },
        { rank: 2, account: 'grandmetropolitan', engagement_rate: 0.9 },
      ],
    },
    history: [
      {
        date: '2026-04-13',
        metmalbekasi: {
          followers: 100,
          following: 10,
          posts: 20,
          avg_likes: 30,
          avg_comments: 4,
          engagement_rate: 1.2,
        },
        grandmetropolitan: {
          followers: 90,
          following: 9,
          posts: 15,
          avg_likes: 20,
          avg_comments: 2,
          engagement_rate: 0.9,
        },
      },
    ],
    presentation_report: {
      executiveSummary: {
        kpis: [],
        bullets: [],
      },
    },
    meta: {
      brand_account: 'metmalbekasi',
      history_days: 1,
    },
  })
}

describe('adaptDashboardData', () => {
  it('maps valid latest metrics for every account', () => {
    const result = adaptDashboardData(createPayload())

    expect(result.latest.metmalbekasi.followers).toBe(100)
    expect(result.meta.brandAccount).toBe('metmalbekasi')
  })

  it('fails fast when latest metric entry is missing', () => {
    const payload = createPayload()
    delete payload.latest.grandmetropolitan

    expect(() => adaptDashboardData(payload)).toThrow('latest.grandmetropolitan tidak tersedia')
  })
})
