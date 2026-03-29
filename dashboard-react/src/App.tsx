import { HeaderBar } from './components/HeaderBar'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { QuickVisual } from './components/QuickVisual'
import { useDashboardData } from './hooks/useDashboardData'
import { getExecutiveSummary, getFreshnessSummary, getQuickVisualData, getTodaySummary } from './data/selectors'
import { getAccountSummaries } from './data/selectors'
import { AccountOverviewGrid } from './components/AccountOverviewGrid'
import { RankingGrowth } from './components/RankingGrowth'
import { ContentBreakdown } from './components/ContentBreakdown'
import { PostSnapshot } from './components/PostSnapshot'

export default function App() {
  const { data, error, loading } = useDashboardData()

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10"><div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">Memuat dashboard…</div></main>
  }

  if (error || !data) {
    return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10"><div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error ?? 'Data tidak tersedia'}</div></main>
  }

  const freshness = getFreshnessSummary(data)
  const executive = getExecutiveSummary(data)
  const today = getTodaySummary(data)
  const quickVisual = getQuickVisualData(data)
  const accountSummaries = getAccountSummaries(data)

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <HeaderBar />
      <FreshnessPanel freshness={freshness} />
      <ExecutiveSummary summary={executive} />
      <TodaySummary today={today} />
      <RankingGrowth data={data} />
      <ContentBreakdown data={data} />
      <PostSnapshot data={data} />
      <AccountOverviewGrid accounts={accountSummaries} />
      <QuickVisual data={quickVisual} />
    </main>
  )
}
