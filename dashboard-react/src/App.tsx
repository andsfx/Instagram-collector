import { Suspense, lazy, useMemo, useState } from 'react'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeroMeta, getHeroSummary, getInsightsData, getQuickVisualData, getTodaySummary, getSummaryStrip } from './data/selectors'
import { AccountOverviewGrid } from './components/AccountOverviewGrid'
import { RankingGrowthPresentation } from './components/RankingGrowthPresentation'
import { ContentBreakdownPresentation } from './components/ContentBreakdownPresentation'
import { PostSnapshot } from './components/PostSnapshot'
import { DailyMetrics } from './components/DailyMetrics'
import { SectionNav, type SectionNavItem } from './components/SectionNav'
import { InsightsPanel } from './components/InsightsPanel'
import { useTheme } from './hooks/useTheme'
import { ErrorState, LoadingState } from './components/ui'
import { SectionAsyncBoundary, SectionLoadingFallback } from './components/SectionAsyncBoundary'
import { SummaryStrip } from './components/SummaryStrip'
import { ClosingSummary } from './components/ClosingSummary'
import type { Period } from './components/PeriodFilter'
import type { RefreshStatus } from './components/RefreshIndicator'

const QuickVisual = lazy(async () => {
  const module = await import('./components/QuickVisual')
  return { default: module.QuickVisual }
})
const FeaturedGrowthChart = lazy(async () => {
  const module = await import('./components/FeaturedGrowthChart')
  return { default: module.FeaturedGrowthChart }
})
const HeadToHead = lazy(async () => {
  const module = await import('./components/HeadToHead')
  return { default: module.HeadToHead }
})
const Heatmap = lazy(async () => {
  const module = await import('./components/HeatmapPresentation')
  return { default: module.HeatmapPresentation }
})

export default function App() {
  const { data, error, loading, retry } = useDashboardData()
  const { theme, toggleTheme } = useTheme()
  const [asyncResetKey, setAsyncResetKey] = useState(0)
  const [isVisualAppendixOpen, setIsVisualAppendixOpen] = useState(false)
  const [period, setPeriod] = useState<Period>('day')

  const freshness = useMemo(() => data ? getFreshnessSummary(data) : null, [data])
  const executive = useMemo(() => data ? getExecutiveSummary(data) : null, [data])
  const today = useMemo(() => data ? getTodaySummary(data) : null, [data])
  const quickVisual = useMemo(() => data ? getQuickVisualData(data) : null, [data])
  const accountSummaries = useMemo(() => data ? getAccountSummaries(data) : [], [data])
  const insights = useMemo(() => data ? getInsightsData(data) : null, [data])
  const summaryStrip = useMemo(() => data ? getSummaryStrip(data) : [], [data])
  const heroMeta = useMemo(() => data ? getHeroMeta(data) : [], [data])
  const heroSummary = useMemo(() => data ? getHeroSummary(data) : undefined, [data])

  function retryAsyncSection() {
    setAsyncResetKey((current) => current + 1)
  }

  const refreshStatus: RefreshStatus = loading ? 'loading' : error ? 'cached' : 'live'

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <LoadingState title="Memuat dashboard..." description="Data sedang divalidasi dari endpoint." />
      </main>
    )
  }

  if (error || !data || !freshness || !executive || !today || !quickVisual || !insights) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid gap-4 text-center">
          <ErrorState title="Data dashboard tidak tersedia" description={error ?? 'Gagal memuat data.'} />
          <button type="button" className="mx-auto inline-flex items-center rounded-[var(--radius-pill)] bg-[image:var(--ig-gradient)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(225,48,108,0.24)]" onClick={retry}>
            Coba lagi
          </button>
        </div>
      </main>
    )
  }

  const sections: SectionNavItem[] = [
    { id: 'section-growth', label: 'Growth' },
    { id: 'section-summary', label: 'Summary' },
    { id: 'section-content', label: 'Content' },
    { id: 'section-comparison', label: 'Comparison' },
    { id: 'section-pattern', label: 'Pattern' },
    { id: 'section-recap', label: 'Recap' },
  ]

  const shell = 'w-full max-w-[1280px] px-5 sm:px-6'

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Left Sidebar */}
      <SectionNav
        items={sections}
        theme={theme}
        onToggleTheme={toggleTheme}
        period={period}
        onPeriodChange={setPeriod}
        refreshStatus={refreshStatus}
        onRefresh={retry}
      />

      {/* Main Content */}
      <main id="main-content" className="ml-[220px] flex-1 overflow-x-clip pb-20">
        <a className="absolute left-[240px] top-4 z-50 -translate-y-16 rounded-[var(--radius-pill)] bg-[var(--ig-purple)] px-4 py-2 text-sm font-medium text-white shadow-lg transition focus:translate-y-0" href="#section-summary">
          Lewati navigasi
        </a>

        {/* Compact Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--panel)] px-5 py-3 shadow-[var(--shadow-sm)] sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-[var(--text)]">{heroSummary?.title ?? 'Dashboard Performa Instagram'}</h1>
            <span className="hidden text-sm text-[var(--text-soft)] sm:inline">{heroSummary?.subtitle ?? ''}</span>
          </div>
          <div className="flex items-center gap-2">
            {heroMeta.slice(0, 3).map((item) => (
              <div key={item.label} className="hidden items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)] lg:inline-flex">
                <span className="uppercase tracking-wide text-[var(--text-soft)]">{item.label}</span>
                <span className="text-[var(--text)]">{item.value}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Sections */}
        <section id="section-growth" className="scroll-mt-16 py-6">
          <div className={`${shell} space-y-6`}>
            <SectionAsyncBoundary resetKey={asyncResetKey + 3} onReset={retryAsyncSection} loadingTitle="Memuat growth chart" loadingDescription="Chart sedang disiapkan." errorTitle="Gagal memuat chart" errorDescription="Chunk chart gagal dimuat.">
              <Suspense fallback={<SectionLoadingFallback title="Memuat growth chart" description="Chart sedang disiapkan." />}>
                <FeaturedGrowthChart data={quickVisual} />
              </Suspense>
            </SectionAsyncBoundary>
            <RankingGrowthPresentation data={data} mode="summary" />
          </div>
        </section>

        <section id="section-summary" className="scroll-mt-16 bg-[var(--panel-muted)] py-6">
          <div className={`${shell} space-y-6`}>
            <ExecutiveSummary summary={executive} />
            <TodaySummary today={today} />
            <SummaryStrip items={summaryStrip} />
            <InsightsPanel insights={insights} />
          </div>
        </section>

        <section id="section-content" className="scroll-mt-16 py-6">
          <div className={`${shell} space-y-6`}>
            <ContentBreakdownPresentation data={data} />
            <PostSnapshot data={data} />
          </div>
        </section>

        <section id="section-comparison" className="scroll-mt-16 bg-[var(--panel-muted)] py-6">
          <div className={`${shell} space-y-6`}>
            <RankingGrowthPresentation data={data} mode="table" />
            <AccountOverviewGrid accounts={accountSummaries} />
            <SectionAsyncBoundary resetKey={asyncResetKey} onReset={retryAsyncSection} loadingTitle="Memuat head-to-head" loadingDescription="Perbandingan sedang disiapkan." errorTitle="Gagal memuat head-to-head" errorDescription="Chunk gagal dimuat.">
              <Suspense fallback={<SectionLoadingFallback title="Memuat head-to-head" description="Perbandingan sedang disiapkan." />}>
                <HeadToHead data={data} />
              </Suspense>
            </SectionAsyncBoundary>
          </div>
        </section>

        <section id="section-pattern" className="scroll-mt-16 py-6">
          <div className={`${shell} space-y-6`}>
            <DailyMetrics data={data} />
            <SectionAsyncBoundary resetKey={asyncResetKey + 1} onReset={retryAsyncSection} loadingTitle="Memuat heatmap" loadingDescription="Agregasi waktu posting." errorTitle="Gagal memuat heatmap" errorDescription="Chunk heatmap gagal.">
              <Suspense fallback={<SectionLoadingFallback title="Memuat heatmap" description="Agregasi waktu posting." />}>
                <Heatmap data={data} />
              </Suspense>
            </SectionAsyncBoundary>
            <SectionAsyncBoundary resetKey={asyncResetKey + 2} onReset={retryAsyncSection} loadingTitle="Memuat chart suite" loadingDescription="Visual analytics tambahan." errorTitle="Gagal memuat chart suite" errorDescription="Chunk visual gagal.">
              <details open={isVisualAppendixOpen} onToggle={(event) => setIsVisualAppendixOpen(event.currentTarget.open)} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">Visual Appendix</div>
                    <div className="text-xs text-[var(--text-soft)]">Chart suite: projection, engagement, share, radar</div>
                  </div>
                  <span className="inline-flex h-7 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-3 text-[10px] font-bold uppercase text-[var(--text-soft)]">
                    {isVisualAppendixOpen ? 'Tutup' : 'Buka'}
                  </span>
                </summary>
                {isVisualAppendixOpen ? (
                  <div className="pt-5">
                    <Suspense fallback={<SectionLoadingFallback title="Memuat chart suite" description="Visual analytics." />}>
                      <QuickVisual data={quickVisual} />
                    </Suspense>
                  </div>
                ) : null}
              </details>
            </SectionAsyncBoundary>
          </div>
        </section>

        <section id="section-recap" className="scroll-mt-16 bg-[var(--panel-muted)] py-6">
          <div className={`${shell} space-y-6`}>
            <ClosingSummary summary={executive} today={today} insights={insights} freshness={freshness} />
            <FreshnessPanel freshness={freshness} />
          </div>
        </section>
      </main>
    </div>
  )
}