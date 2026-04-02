import { useEffect, useState } from 'react'
import { adaptDashboardData } from '../data/adapter'
import { dashboardSchema } from '../data/schema'
import type { DashboardRecord } from '../data/types'

const DASHBOARD_DATA_ENDPOINT = '/api/dashboard-data'

interface DashboardState {
  data: DashboardRecord | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useDashboardData(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    retry: () => {},
  })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    const retry = () => {
      setReloadToken((current) => current + 1)
    }

    async function load() {
      if (active) {
        setState((current) => ({
          ...current,
          loading: true,
          error: null,
          retry,
        }))
      }

      try {
        const response = await fetch(DASHBOARD_DATA_ENDPOINT, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Gagal mengambil data runtime (${response.status})`)
        }

        const payload = await response.json()
        const parsed = dashboardSchema.parse(payload)
        const adapted = adaptDashboardData(parsed)

        if (!active) return

        setState({
          data: adapted,
          loading: false,
          error: null,
          retry,
        })
      } catch (error) {
        if (!active) return

        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Gagal memuat data dashboard',
          retry,
        })
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [reloadToken])

  return state
}
