import { afterEach, describe, expect, it, vi } from 'vitest'
import { dashboardSchema } from '../data/schema'
import { requestDashboardData, resetDashboardDataRuntime } from './useDashboardData'

function createPayload(account: string, followers: number) {
  return dashboardSchema.parse({
    generated_at: '2026-04-13T00:00:00Z',
    generated_at_wib: '2026-04-13T07:00:00+07:00',
    version: 2,
    sources: {
      stats: 'socialblade',
      engagement: 'apify',
    },
    accounts: [account],
    latest: {
      date: '2026-04-13',
      [account]: {
        followers,
        following: 10,
        posts: 20,
        avg_likes: 30,
        avg_comments: 4,
        engagement_rate: 1.2,
      },
    },
    growth: {
      [account]: {
        followers_change_1d: 1,
        followers_change_7d: 7,
        pct_change_7d: 7,
      },
    },
    rankings: {
      by_followers: [{ rank: 1, account, followers }],
      by_engagement_rate: [{ rank: 1, account, engagement_rate: 1.2 }],
    },
    history: [
      {
        date: '2026-04-13',
        [account]: {
          followers,
          following: 10,
          posts: 20,
          avg_likes: 30,
          avg_comments: 4,
          engagement_rate: 1.2,
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
      brand_account: account,
      history_days: 1,
    },
  })
}

afterEach(() => {
  resetDashboardDataRuntime()
  vi.restoreAllMocks()
})

describe('requestDashboardData', () => {
  it('reuses cache when refresh is not forced', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => createPayload('metmalbekasi', 100),
    })

    vi.stubGlobal('fetch', fetchMock)

    const first = await requestDashboardData(false)
    const second = await requestDashboardData(false)

    expect(first.latest.metmalbekasi.followers).toBe(100)
    expect(second.latest.metmalbekasi.followers).toBe(100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('aborts old inflight request and uses fresh response on force refresh', async () => {
    const abortSignals: AbortSignal[] = []

    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_input: string, init?: RequestInit) => {
        const signal = init?.signal as AbortSignal
        abortSignals.push(signal)

        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })

          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => createPayload('metmalbekasi', 100),
            })
          }, 25)
        })
      })
      .mockImplementationOnce(async (_input: string, init?: RequestInit) => {
        abortSignals.push(init?.signal as AbortSignal)
        return {
          ok: true,
          json: async () => createPayload('metmalbekasi', 200),
        }
      })

    vi.stubGlobal('fetch', fetchMock)

    const firstPromise = requestDashboardData(false)
    const secondPromise = requestDashboardData(true)

    expect(abortSignals[0]?.aborted).toBe(true)

    await expect(firstPromise).rejects.toMatchObject({ name: 'AbortError' })

    const latest = await secondPromise

    expect(latest.latest.metmalbekasi.followers).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
