import { useCallback, useEffect, useRef, useState } from 'react'
import { adaptDashboardData } from '../data/adapter'
import { dashboardSchema } from '../data/schema'
import type { DashboardRecord } from '../data/types'

const DASHBOARD_DATA_ENDPOINT = '/api/dashboard-data'
const REQUEST_TIMEOUT_MS = 15_000

/**
 * State machine states:
 * - idle: no request in progress
 * - loading: initial load (no cached data)
 * - refreshing: retry/refresh (cached data exists)
 * - success: data loaded successfully
 * - error: request failed
 */
type FetchPhase = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'

type DataSource = 'live' | 'cached' | null

interface DashboardState {
  data: DashboardRecord | null
  loading: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  dataSource: DataSource
}

interface UseDashboardDataResult extends DashboardState {
  retry: () => void
}

let dashboardCache: DashboardRecord | null = null
let inflightRequest: Promise<DashboardRecord> | null = null
let inflightController: AbortController | null = null
let inflightSubscribers = 0
let inflightRequestId = 0

function abortInflightRequest(): boolean {
  if (!inflightController) return false
  try {
    inflightController.abort()
  } catch {
    // Abort may fail if request already completed
    return false
  }
  inflightController = null
  inflightRequest = null
  return true
}

/**
 * Fetch dashboard data with abort support and timeout.
 * Only one active request at a time.
 */
export async function requestDashboardData(
  forceRefresh = false,
  signal?: AbortSignal,
): Promise<DashboardRecord> {
  if (forceRefresh) {
    abortInflightRequest()
  }

  if (!forceRefresh && dashboardCache) {
    return dashboardCache
  }

  if (inflightRequest && !forceRefresh) {
    return inflightRequest
  }

  // Wait for previous request to finish if abort didn't work
  if (inflightRequest && forceRefresh) {
    try {
      await inflightRequest
    } catch {
      // Previous request failed or was aborted — proceed
    }
  }

  inflightController = new AbortController()
  const requestId = inflightRequestId + 1
  inflightRequestId = requestId
  const controller = inflightController

  // Link external signal to our controller
  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  inflightRequest = fetch(DASHBOARD_DATA_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
    signal: controller.signal,
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
      clearTimeout(timeoutId)
      if (inflightRequestId === requestId) {
        inflightRequest = null
        inflightController = null
      }
    })

  return inflightRequest
}

function retainInflightRequest() {
  inflightSubscribers += 1
}

function releaseInflightRequest() {
  inflightSubscribers = Math.max(0, inflightSubscribers - 1)

  if (inflightSubscribers === 0 && inflightController) {
    abortInflightRequest()
  }
}

export function resetDashboardDataRuntime() {
  dashboardCache = null
  inflightSubscribers = 0
  inflightRequestId = 0
  abortInflightRequest()
}

/** Expose cache for testing */
export function getDashboardCache(): DashboardRecord | null {
  return dashboardCache
}

export function useDashboardData(): UseDashboardDataResult {
  const [state, setState] = useState<DashboardState>(() => ({
    data: dashboardCache,
    loading: dashboardCache === null,
    isLoading: dashboardCache === null,
    isRefreshing: false,
    error: null,
    dataSource: dashboardCache ? 'live' : null,
  }))
  const [reloadToken, setReloadToken] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const retry = useCallback(() => {
    setReloadToken((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true
    const forceRefresh = reloadToken > 0
    retainInflightRequest()

    // Create a local abort controller for this effect
    const localController = new AbortController()
    abortRef.current = localController

    async function load() {
      // If we have cache and not forcing refresh, return immediately
      if (!forceRefresh && dashboardCache) {
        if (active) {
          setState({
            data: dashboardCache,
            loading: false,
            isLoading: false,
            isRefreshing: false,
            error: null,
            dataSource: 'live',
          })
        }
        return
      }

      // Determine phase: loading (no data) or refreshing (has cached data)
      const phase: FetchPhase = dashboardCache ? 'refreshing' : 'loading'

      if (active) {
        setState((current) => ({
          data: current.data,
          loading: true,
          // Ensure isLoading and isRefreshing are never both true
          isLoading: phase === 'loading',
          isRefreshing: phase === 'refreshing',
          error: null,
          dataSource: current.dataSource,
        }))
      }

      try {
        const adapted = await requestDashboardData(forceRefresh, localController.signal)

        if (!active) return

        setState({
          data: adapted,
          loading: false,
          isLoading: false,
          isRefreshing: false,
          error: null,
          dataSource: 'live',
        })
      } catch (error) {
        if (!active) return
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Determine if this was a timeout or a user-initiated abort
          // If we have cached data, show it; otherwise show unavailable
          if (dashboardCache) {
            setState({
              data: dashboardCache,
              loading: false,
              isLoading: false,
              isRefreshing: false,
              error: 'Request timeout — menampilkan data cached',
              dataSource: 'cached',
            })
          } else {
            setState({
              data: null,
              loading: false,
              isLoading: false,
              isRefreshing: false,
              error: 'Data tidak tersedia — request timeout',
              dataSource: null,
            })
          }
          return
        }

        // Non-abort error: show cached data if available
        const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data dashboard'

        if (dashboardCache) {
          setState({
            data: dashboardCache,
            loading: false,
            isLoading: false,
            isRefreshing: false,
            error: errorMessage,
            dataSource: 'cached',
          })
        } else {
          setState({
            data: null,
            loading: false,
            isLoading: false,
            isRefreshing: false,
            error: errorMessage,
            dataSource: null,
          })
        }
      }
    }

    void load()

    return () => {
      active = false
      localController.abort()
      releaseInflightRequest()
    }
  }, [reloadToken])

  return {
    ...state,
    retry,
  }
}
