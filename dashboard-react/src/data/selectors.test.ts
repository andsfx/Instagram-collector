import { describe, expect, it } from 'vitest'
import { getHeadToHeadDefaults, resolveHeadToHeadPreset } from './selectors'
import type { DashboardRecord } from './types'

function createTestData(overrides?: Partial<DashboardRecord>): DashboardRecord {
  const defaultRecord: DashboardRecord = {
    version: 2,
    generatedAt: '2026-07-30T10:00:00.000Z',
    generatedAtWib: '2026-07-30T17:00:00.000+07:00',
    latestDate: '2026-07-30',
    accounts: ['metmalbekasi', 'grandmetropolitan', 'summareconmalbekasi', 'pakuwonmallbekasi'],
    latest: {
      metmalbekasi: { followers: 93505, following: 500, posts: 120, avg_likes: 250, avg_comments: 15, engagement_rate: 2.65 },
      grandmetropolitan: { followers: 92455, following: 600, posts: 100, avg_likes: 300, avg_comments: 20, engagement_rate: 3.5 },
      summareconmalbekasi: { followers: 332974, following: 800, posts: 200, avg_likes: 150, avg_comments: 10, engagement_rate: 1.8 },
      pakuwonmallbekasi: { followers: 72247, following: 400, posts: 80, avg_likes: 200, avg_comments: 12, engagement_rate: 2.2 },
    },
    history: [
      {
        date: '2026-07-29',
        values: {
          metmalbekasi: { followers: 93500, following: 500, posts: 120, avg_likes: 250, avg_comments: 15, engagement_rate: 2.65 },
          grandmetropolitan: { followers: 92450, following: 600, posts: 100, avg_likes: 300, avg_comments: 20, engagement_rate: 3.5 },
          summareconmalbekasi: { followers: 332970, following: 800, posts: 200, avg_likes: 150, avg_comments: 10, engagement_rate: 1.8 },
          pakuwonmallbekasi: { followers: 72245, following: 400, posts: 80, avg_likes: 200, avg_comments: 12, engagement_rate: 2.2 },
        },
      },
    ],
    growth: {
      metmalbekasi: { followers_change_1d: 5, followers_change_7d: 50, pct_change_7d: 0.05 },
      grandmetropolitan: { followers_change_1d: 5, followers_change_7d: 100, pct_change_7d: 0.11 },
      summareconmalbekasi: { followers_change_1d: 4, followers_change_7d: 200, pct_change_7d: 0.06 },
      pakuwonmallbekasi: { followers_change_1d: 2, followers_change_7d: 30, pct_change_7d: 0.04 },
    },
    rankings: {
      by_followers: [
        { rank: 1, account: 'summareconmalbekasi', followers: 332974 },
        { rank: 2, account: 'metmalbekasi', followers: 93505 },
        { rank: 3, account: 'grandmetropolitan', followers: 92455 },
        { rank: 4, account: 'pakuwonmallbekasi', followers: 72247 },
      ],
      by_engagement_rate: [
        { rank: 1, account: 'grandmetropolitan', engagement_rate: 3.5 },
        { rank: 2, account: 'metmalbekasi', engagement_rate: 2.65 },
        { rank: 3, account: 'pakuwonmallbekasi', engagement_rate: 2.2 },
        { rank: 4, account: 'summareconmalbekasi', engagement_rate: 1.8 },
      ],
    },
    meta: { brandAccount: 'metmalbekasi' },
    sources: { stats: 'socialblade', engagement: 'apify' },
    content_breakdown: {},
    post_insights: {},
    presentation: { executiveKpis: [], executiveBullets: [] },
    ...overrides,
  }
  return defaultRecord
}

describe('HeadToHead Defaults', () => {
  describe('getHeadToHeadDefaults', () => {
    it('Default: A = brand, B = largest followers peer, metric = followers', () => {
      const data = createTestData()
      const defaults = getHeadToHeadDefaults(data)
      expect(defaults.accountA).toBe('metmalbekasi')
      expect(defaults.accountB).toBe('summareconmalbekasi') // has 332K followers
      expect(defaults.metric).toBe('followers')
    })
  })

  describe('resolveHeadToHeadPreset', () => {
    it('Brand-top-followers preset returns brand vs largest followers peer', () => {
      const data = createTestData()
      const result = resolveHeadToHeadPreset(data, 'brand-top-followers', 'metmalbekasi', 'pakuwonmallbekasi')
      expect(result.accountA).toBe('metmalbekasi')
      expect(result.accountB).toBe('summareconmalbekasi')
    })

    it('Brand-top-er preset returns brand vs highest ER peer', () => {
      const data = createTestData()
      const result = resolveHeadToHeadPreset(data, 'brand-top-er', 'metmalbekasi', 'summareconmalbekasi')
      expect(result.accountA).toBe('metmalbekasi')
      expect(result.accountB).toBe('grandmetropolitan') // ER = 3.5
    })

    it('Top-two preset returns top 2 by followers', () => {
      const data = createTestData()
      const result = resolveHeadToHeadPreset(data, 'top-two', '', '')
      expect(result.accountA).toBe('summareconmalbekasi')
      expect(result.accountB).toBe('metmalbekasi')
    })

    it('When brand is not in meta.brandAccount, still falls back to first account', () => {
      const data = createTestData({ meta: { brandAccount: null } })
      const defaults = getHeadToHeadDefaults(data)
      expect(defaults.accountA).toBe('metmalbekasi')
      expect(defaults.accountB).toBe('summareconmalbekasi')
    })
  })
})
