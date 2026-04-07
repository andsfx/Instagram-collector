import { useCallback, useEffect, useState } from 'react'
import { adaptDashboardData } from '../data/adapter'
import { dashboardSchema } from '../data/schema'
import type { DashboardRecord } from '../data/types'

const DASHBOARD_DATA_ENDPOINT = '/api/dashboard-data'

interface DashboardState {
  data: DashboardRecord | null
  loading: boolean
  error: string | null
}

interface UseDashboardDataResult extends DashboardState {
  retry: () => void
}

let dashboardCache: DashboardRecord | null = null
let inflightRequest: Promise<DashboardRecord> | null = null
let inflightController: AbortController | null = null
let inflightSubscribers = 0

async function requestDashboardData(forceRefresh = false): Promise<DashboardRecord> {
  if (forceRefresh) {
    dashboardCache = null
  }

  if (!forceRefresh && dashboardCache) {
    return dashboardCache
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightController = new AbortController()

  inflightRequest = fetch(DASHBOARD_DATA_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
    signal: inflightController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Gagal mengambil data runtime (${response.status})`)
      }

      const payload = await response.json()
      const parsed = dashboardSchema.parse(payload)
      const adapted = adaptDashboardData(parsed)
      dashboardCache = adapted
      return adapted
    })
    .finally(() => {
      inflightRequest = null
      inflightController = null
    })

  return inflightRequest
}

function retainInflightRequest() {
  inflightSubscribers += 1
}

function releaseInflightRequest() {
  inflightSubscribers = Math.max(0, inflightSubscribers - 1)

  if (inflightSubscribers === 0 && inflightController) {
    inflightController.abort()
    inflightController = null
    inflightRequest = null
  }
}

export function useDashboardData(): UseDashboardDataResult {
  const [state, setState] = useState<DashboardState>(() => ({
    data: dashboardCache,
    loading: dashboardCache === null,
    error: null,
  }))
  const [reloadToken, setReloadToken] = useState(0)
  const retry = useCallback(() => {
    dashboardCache = null
    setReloadToken((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true
    const forceRefresh = reloadToken > 0
    retainInflightRequest()

    async function load() {
      if (!forceRefresh && dashboardCache) {
        if (active) {
          setState({
            data: dashboardCache,
            loading: false,
            error: null,
          })
        }
        return
      }

      if (active) {
        setState((current) => ({
          data: current.data,
          loading: true,
          error: null,
        }))
      }

      try {
        const adapted = await requestDashboardData(forceRefresh)

        if (!active) return

        setState({
          data: adapted,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (!active) return
        if (error instanceof DOMException && error.name === 'AbortError') return

        setState({
          data: dashboardCache,
          loading: false,
          error: error instanceof Error ? error.message : 'Gagal memuat data dashboard',
        })
      }
    }

    void load()

    return () => {
      active = false
      releaseInflightRequest()
    }
  }, [reloadToken])

  return {
    ...state,
    retry,
  }
}
