import { Suspense, lazy, useState } from 'react'
import { HeaderBar } from './components/HeaderBar'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeroMeta, getInsightsData, getQuickVisualData, getTodaySummary } from './data/selectors'
import { getSummaryStrip } from './data/selectors'
import { AccountOverviewGrid } from './components/AccountOverviewGrid'
import { RankingGrowth } from './components/RankingGrowth'
import { ContentBreakdown } from './components/ContentBreakdown'
import { PostSnapshot } from './components/PostSnapshot'
import { DailyMetrics } from './components/DailyMetrics'
import { SectionNav, type SectionNavItem } from './components/SectionNav'
import { InsightsPanel } from './components/InsightsPanel'
import { useTheme } from './hooks/useTheme'
import { ErrorState, LoadingState } from './components/ui'
import { SectionAsyncBoundary, SectionLoadingFallback } from './components/SectionAsyncBoundary'
import { SummaryStrip } from './components/SummaryStrip'

const QuickVisual = lazy(async () => {
  const module = await import('./components/QuickVisual')
  return { default: module.QuickVisual }
})

const HeadToHead = lazy(async () => {
  const module = await import('./components/HeadToHead')
  return { default: module.HeadToHead }
})

const Heatmap = lazy(async () => {
  const module = await import('./components/Heatmap')
  return { default: module.Heatmap }
})

export default function App() {
  const { data, error, loading, retry } = useDashboardData()
  const { theme, toggleTheme } = useTheme()
  const [asyncResetKey, setAsyncResetKey] = useState(0)

  function retryAsyncSection() {
    setAsyncResetKey((current) => current + 1)
  }

  if (loading) {
    return (
      <main className="loader panel">
        <LoadingState
          title="Memuat dashboard React..."
          description="Data sedang divalidasi dan diadaptasi dari endpoint runtime dashboard."
        />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="error-panel panel section-card">
        <ErrorState title="Data dashboard tidak tersedia" description={error ?? 'Permintaan ke endpoint runtime gagal.'} />
        <div>
          <button type="button" className="retry-button" onClick={retry}>
            Coba ambil ulang data
          </button>
        </div>
      </main>
    )
  }

  const freshness = getFreshnessSummary(data)
  const executive = getExecutiveSummary(data)
  const today = getTodaySummary(data)
  const quickVisual = getQuickVisualData(data)
  const accountSummaries = getAccountSummaries(data)
  const insights = getInsightsData(data)
  const summaryStrip = getSummaryStrip(data)
  const heroMeta = getHeroMeta(data)
  const sections: SectionNavItem[] = [
    { id: 'section-freshness', label: 'Status' },
    { id: 'section-summary', label: 'Summary' },
    { id: 'section-daily', label: 'Daily' },
    { id: 'section-ranking', label: 'Ranking' },
    { id: 'section-content', label: 'Content' },
    { id: 'section-overview', label: 'Overview' },
    { id: 'section-h2h', label: 'Head-to-Head' },
    { id: 'section-heatmap', label: 'Heatmap' },
    { id: 'section-insights', label: 'Insights' },
    { id: 'section-visual', label: 'Visual' },
  ]

  return (
    <main id="main-content" className="app-shell stack-lg">
      <a className="skip-link" href="#section-freshness">Lewati navigasi dan langsung ke konten</a>
      <section className="section-bleed section-shell-hero">
        <div className="section-inner section-inner-wide">
          <HeaderBar onRefresh={retry} heroMeta={heroMeta} />
        </div>
      </section>

      <section className="section-bleed section-shell-nav">
        <div className="section-inner section-inner-wide">
          <SectionNav items={sections} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </section>

      <section id="section-summary" className="section-anchor section-bleed section-shell-summary">
        <div className="section-inner section-inner-wide stack-lg">
          <ExecutiveSummary summary={executive} />
          <TodaySummary today={today} />
          <SummaryStrip items={summaryStrip} />
          <InsightsPanel insights={insights} />
        </div>
      </section>

      <section id="section-freshness" className="section-anchor section-bleed">
        <div className="section-inner">
          <FreshnessPanel freshness={freshness} />
        </div>
      </section>

      <section id="section-daily" className="section-anchor section-bleed">
        <div className="section-inner">
          <DailyMetrics data={data} />
        </div>
      </section>

      <section id="section-ranking" className="section-anchor section-bleed">
        <div className="section-inner">
          <RankingGrowth data={data} />
        </div>
      </section>

      <section id="section-content" className="section-anchor section-bleed">
        <div className="section-inner stack-lg">
          <ContentBreakdown data={data} />
          <PostSnapshot data={data} />
        </div>
      </section>

      <section id="section-overview" className="section-anchor section-bleed">
        <div className="section-inner">
          <AccountOverviewGrid accounts={accountSummaries} />
        </div>
      </section>

      <section id="section-h2h" className="section-anchor section-bleed">
        <div className="section-inner">
          <SectionAsyncBoundary
            resetKey={asyncResetKey}
            onReset={retryAsyncSection}
            loadingTitle="Memuat perbandingan akun"
            loadingDescription="Head-to-head sedang disiapkan."
            errorTitle="Gagal memuat head-to-head"
            errorDescription="Chunk section perbandingan akun gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat perbandingan akun" description="Head-to-head sedang disiapkan." />}>
              <HeadToHead data={data} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>

      <section id="section-heatmap" className="section-anchor section-bleed">
        <div className="section-inner">
          <SectionAsyncBoundary
            resetKey={asyncResetKey + 1}
            onReset={retryAsyncSection}
            loadingTitle="Memuat heatmap waktu posting"
            loadingDescription="Agregasi slot waktu sedang dihitung."
            errorTitle="Gagal memuat heatmap"
            errorDescription="Chunk heatmap gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat heatmap waktu posting" description="Agregasi slot waktu sedang dihitung." />}>
              <Heatmap data={data} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>

      <section id="section-visual" className="section-anchor section-bleed">
        <div className="section-inner">
          <SectionAsyncBoundary
            resetKey={asyncResetKey + 2}
            onReset={retryAsyncSection}
            loadingTitle="Memuat chart suite"
            loadingDescription="Visual analytics tambahan sedang di-load terpisah."
            errorTitle="Gagal memuat chart suite"
            errorDescription="Chunk visual analytics gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat chart suite" description="Visual analytics tambahan sedang di-load terpisah." />}>
              <QuickVisual data={quickVisual} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>
    </main>
  )
}
