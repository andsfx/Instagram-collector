import { describe, expect, it } from 'vitest'
import { getReachSummary } from './selectors'
import type { DashboardRecord, MetricEntry } from './types'

function entry(partial: Partial<MetricEntry>): MetricEntry {
  return {
    followers: 1000,
    following: 10,
    posts: 20,
    avg_likes: 5,
    avg_comments: 1,
    engagement_rate: 0.5,
    ...partial,
  }
}

function buildData(history: DashboardRecord['history']): DashboardRecord {
  return {
    generatedAt: '2026-10-29T00:00:00Z',
    generatedAtWib: '2026-10-29T07:00:00+07:00',
    version: 2,
    sources: { stats: 'supabase', engagement: 'supabase' },
    latestDate: history[history.length - 1]?.date ?? '',
    accounts: ['metmalbekasi', 'grandmetropolitan', 'pakuwonmallbekasi'],
    latest: {
      metmalbekasi: entry({ reach: 20518, new_followers: 0 }),
      grandmetropolitan: entry({ reach: 76083, new_followers: 0 }),
      pakuwonmallbekasi: entry({}),
    },
    growth: {
      metmalbekasi: { followers_change_1d: 0, followers_change_7d: 0, pct_change_7d: 0 },
      grandmetropolitan: { followers_change_1d: 0, followers_change_7d: 0, pct_change_7d: 0 },
      pakuwonmallbekasi: { followers_change_1d: 0, followers_change_7d: 0, pct_change_7d: 0 },
    },
    rankings: { by_followers: [], by_engagement_rate: [] },
    presentation: { executiveKpis: [], executiveBullets: [] },
    history,
    meta: { brandAccount: null },
  }
}

describe('getReachSummary', () => {
  it('memakai baris terakhir yang benar-benar punya insight, bukan tanggal terbaru yang masih null', () => {
    const data = buildData([
      {
        date: '2026-10-28',
        values: {
          metmalbekasi: entry({ reach: 20518, new_followers: 0 }),
          grandmetropolitan: entry({ reach: 76083, new_followers: 0 }),
          pakuwonmallbekasi: entry({}),
        },
      },
      {
        date: '2026-10-29',
        values: {
          metmalbekasi: entry({}),
          grandmetropolitan: entry({}),
          pakuwonmallbekasi: entry({}),
        },
      },
    ])

    const result = getReachSummary(data)
    expect(result.date).toBe('2026-10-28')
    expect(result.rows.map((row) => row.account)).toEqual(['grandmetropolitan', 'metmalbekasi'])
    expect(result.rows[0]).toEqual({ account: 'grandmetropolitan', newFollowers: 0, reach: 76083 })
  })

  it('menyebut akun tanpa akses Graph di daftar missing', () => {
    const data = buildData([
      {
        date: '2026-10-28',
        values: {
          metmalbekasi: entry({ reach: 20518, new_followers: 12 }),
          grandmetropolitan: entry({ reach: 76083, new_followers: 5 }),
          pakuwonmallbekasi: entry({}),
        },
      },
    ])

    const result = getReachSummary(data)
    expect(result.missing).toEqual(['pakuwonmallbekasi'])
  })

  it('kembalikan kosong kalau belum ada insight sama sekali', () => {
    const data = buildData([
      {
        date: '2026-10-29',
        values: {
          metmalbekasi: entry({}),
          grandmetropolitan: entry({}),
          pakuwonmallbekasi: entry({}),
        },
      },
    ])

    const result = getReachSummary(data)
    expect(result).toEqual({
      date: null,
      rows: [],
      missing: ['metmalbekasi', 'grandmetropolitan', 'pakuwonmallbekasi'],
    })
  })
})
