import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeadToHeadDefaults, getHeroMeta, getHeroSummary, getInsightsData, getQuickVisualData, getTodaySummary, getSummaryStrip } from './data/selectors'
import { AccountOverviewGrid } from './components/AccountOverviewGrid'
import { RankingGrowthPresentation } from './components/RankingGrowthPresentation'
import { ContentBreakdownPresentation } from './components/ContentBreakdownPresentation'
import { PostSnapshot } from './components/PostSnapshot'
import { DailyMetrics } from './components/DailyMetrics'
import { SectionNav, type SectionNavItem } from './components/SectionNav'
import { InsightsPanel } from './components/InsightsPanel'
import { useTheme } from './hooks/useTheme'
import { ErrorState } from './components/ui'
import { SectionAsyncBoundary } from './components/SectionAsyncBoundary'
import { SummaryStrip } from './components/SummaryStrip'
import { ClosingSummary } from './components/ClosingSummary'
import { GrowthSkeleton, HeadToHeadSkeleton, HeatmapSkeleton, ChartSuiteSkeleton, DashboardSkeleton } from './components/SkeletonFallbacks'
import type { RefreshStatus } from './components/RefreshIndicator'
import type { HeadToHeadMetric } from './data/selectors'

const SECTIONS: SectionNavItem[] = [
  { id: 'section-summary', label: 'Summary', description: 'Ringkasan eksekutif performa hari ini dan insight utama.' },
  { id: 'section-growth', label: 'Growth', description: 'Pantau tren pertumbuhan followers dan engagement semua akun.' },
  { id: 'section-content', label: 'Content', description: 'Analisis jenis konten, frekuensi posting, dan snapshot postingan terbaru.' },
  { id: 'section-comparison', label: 'Comparison', description: 'Bandingkan performa antar akun secara head-to-head dan ranking.' },
  { id: 'section-charts', label: 'Charts', description: 'Visualisasi metrik lengkap dalam berbagai format chart interaktif.' },
  { id: 'section-pattern', label: 'Pattern', description: 'Temukan pola waktu posting dan metrik harian tiap akun.' },
  { id: 'section-recap', label: 'Recap', description: 'Rekap menyeluruh dan status kesegaran data yang dikumpulkan.' },
]

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
  const { data, error, loading, isLoading, isRefreshing, retry } = useDashboardData()
  const { theme, toggleTheme } = useTheme()
  const [asyncResetKey, setAsyncResetKey] = useState(0)
  const [activeSection, setActiveSection] = useState('section-summary')

  // HeadToHead state
  const headToHeadDefaults = useMemo(() => data ? getHeadToHeadDefaults(data) : { accountA: '', accountB: '', metric: 'followers' as HeadToHeadMetric }, [data])
  const [h2hAccountA, setH2hAccountA] = useState(headToHeadDefaults.accountA)
  const [h2hAccountB, setH2hAccountB] = useState(headToHeadDefaults.accountB)
  const [h2hMetric, setH2hMetric] = useState<HeadToHeadMetric>(headToHeadDefaults.metric)
  const [h2hPresetValue, setH2hPresetValue] = useState('')

  // DailyMetrics state
  const [dmSelectedAccount, setDmSelectedAccount] = useState<string>(data?.accounts[0] ?? '')
  const [dmRangeDays, setDmRangeDays] = useState<number>(7)
  const accountsKey = data?.accounts.join('\u0000') ?? ''

  useEffect(() => {
    const accounts = data?.accounts ?? []
    if (accounts.length === 0) {
      return
    }

    setH2hAccountA((current) => accounts.includes(current) ? current : accounts[0])
    setH2hAccountB((current) => accounts.includes(current) ? current : accounts[1] ?? accounts[0])
    setDmSelectedAccount((current) => accounts.includes(current) ? current : accounts[0])
  }, [accountsKey, data?.accounts])

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

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id)
  }, [])

  const handleRefresh = useCallback(() => {
    retry()
  }, [retry])

  const refreshStatus: RefreshStatus = isRefreshing ? 'loading' : error ? 'cached' : 'live'
  const refreshDisabled = isLoading || isRefreshing

  const activeItem = SECTIONS.find((s) => s.id === activeSection)

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-[var(--bg)]">
        <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} refreshStatus="loading" refreshDisabled activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="lg:ml-[220px] flex-1 overflow-x-hidden pt-[60px] lg:pt-0 max-w-full">
          <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--panel)] px-6 py-3 shadow-[var(--shadow-sm)] lg:px-8">
            <div className="h-4 w-48 skeleton rounded" />
          </header>
          <div className="mx-auto w-full max-w-[1080px] px-6 lg:px-8">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  if (error || !data || !freshness || !executive || !today || !quickVisual || !insights) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-[var(--bg)]">
        <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} refreshStatus="cached" activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="lg:ml-[220px] flex min-h-screen flex-1 items-center justify-center overflow-x-hidden px-6 py-16 pt-[60px] lg:pt-16 max-w-full">
          <div className="grid gap-4 text-center">
            <ErrorState title="Data dashboard tidak tersedia" description={error ?? 'Gagal memuat data.'} />
            <button type="button" className="mx-auto inline-flex items-center rounded-[var(--radius-pill)] bg-[image:var(--ig-gradient)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(225,48,108,0.24)]" onClick={retry}>
              Coba lagi
            </button>
          </div>
        </main>
      </div>
    )
  }

  const shell = 'mx-auto w-full max-w-[1080px] px-6 lg:px-8'
  const sectionClass = (sectionId: string, background = '') => [
    activeSection === sectionId ? 'flex-1 overflow-y-auto' : 'hidden',
    background,
    'py-8',
  ].filter(Boolean).join(' ')
  const h2hAccountAValue = h2hAccountA || headToHeadDefaults.accountA
  const h2hAccountBValue = h2hAccountB || headToHeadDefaults.accountB
  const dmSelectedAccountValue = dmSelectedAccount || data.accounts[0] || ''

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[var(--bg)]">
      <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} refreshStatus={refreshStatus} onRefresh={handleRefresh} refreshDisabled={refreshDisabled} activeSection={activeSection} onSectionChange={handleSectionChange} />

      <main id="dashboard-main" tabIndex={-1} className="lg:ml-[220px] flex-1 overflow-hidden h-screen pt-[60px] lg:pt-0 max-w-full flex flex-col">
        <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[68px] focus:z-50 focus:rounded-[var(--radius-pill)] focus:bg-[var(--ig-purple)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg lg:focus:left-[240px] lg:focus:top-4" href="#dashboard-main">
          Lewati navigasi
        </a>

        <header className="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--panel)] px-6 py-3 shadow-[var(--shadow-sm)] lg:flex lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-[var(--text)]">{heroSummary?.title ?? 'Dashboard Performa Instagram'}</h1>
            <span className="hidden text-sm text-[var(--text-soft)] sm:inline">{heroSummary?.subtitle ?? ''}</span>
          </div>
          <div className="flex items-center gap-2">
            {heroMeta.slice(0, 3).map((item) => (
              <div key={item.label} className="hidden items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)] lg:inline-flex cursor-default select-none">
                <span className="uppercase tracking-wide text-[var(--text-soft)]">{item.label}</span>
                <span className="text-[var(--text)]">{item.value}</span>
              </div>
            ))}
            <button type="button" className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-55" onClick={handleRefresh} disabled={refreshDisabled} aria-disabled={refreshDisabled}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"/><path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"/></svg>
              Refresh Data
            </button>
          </div>
        </header>

        {activeItem && (
          <div className="border-b border-[var(--border)] bg-[var(--panel)] px-6 py-4 lg:px-8">
            <h2 className="text-lg font-bold text-[var(--text)]">{activeItem.label}</h2>
            {activeItem.description && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{activeItem.description}</p>
            )}
          </div>
        )}

        {/* Growth */}
        <section key="section-growth" id="section-growth" className={sectionClass('section-growth')}>
          <div className={`${shell} space-y-6`}>
            <SectionAsyncBoundary resetKey={asyncResetKey + 3} onReset={retryAsyncSection} loadingTitle="Memuat growth" loadingDescription="Data sedang disiapkan." errorTitle="Gagal memuat" errorDescription="Chunk gagal dimuat.">
              <Suspense fallback={<GrowthSkeleton />}>
                <FeaturedGrowthChart data={quickVisual} />
              </Suspense>
            </SectionAsyncBoundary>
          </div>
        </section>

        {/* Summary */}
        <section key="section-summary" id="section-summary" className={sectionClass('section-summary', 'bg-[var(--panel-muted)]')}>
          <div className={`${shell} space-y-6`}>
            <ExecutiveSummary summary={executive} />
            <TodaySummary today={today} />
            <SummaryStrip items={summaryStrip} />
            <InsightsPanel insights={insights} />
          </div>
        </section>

        {/* Content */}
        <section key="section-content" id="section-content" className={sectionClass('section-content')}>
          <div className={`${shell} space-y-6`}>
            <ContentBreakdownPresentation data={data} />
            <PostSnapshot data={data} />
          </div>
        </section>

        {/* Comparison */}
        <section key="section-comparison" id="section-comparison" className={sectionClass('section-comparison', 'bg-[var(--panel-muted)]')}>
          <div className={`${shell} space-y-6`}>
            <RankingGrowthPresentation data={data} mode="table" />
            <AccountOverviewGrid accounts={accountSummaries} />
            <SectionAsyncBoundary resetKey={asyncResetKey} onReset={retryAsyncSection} loadingTitle="Memuat head-to-head" loadingDescription="Perbandingan sedang disiapkan." errorTitle="Gagal memuat head-to-head" errorDescription="Chunk gagal dimuat.">
              <Suspense fallback={<HeadToHeadSkeleton />}>
                <HeadToHead
                  data={data}
                  accountA={h2hAccountAValue}
                  setAccountA={setH2hAccountA}
                  accountB={h2hAccountBValue}
                  setAccountB={setH2hAccountB}
                  metric={h2hMetric}
                  setMetric={setH2hMetric}
                  presetValue={h2hPresetValue}
                  setPresetValue={setH2hPresetValue}
                />
              </Suspense>
            </SectionAsyncBoundary>
          </div>
        </section>

        {/* Charts */}
        <section key="section-charts" id="section-charts" className={sectionClass('section-charts')}>
          <div className={`${shell} space-y-6`}>
            <SectionAsyncBoundary resetKey={asyncResetKey + 2} onReset={retryAsyncSection} loadingTitle="Memuat chart suite" loadingDescription="Visual analytics sedang dimuat." errorTitle="Gagal memuat chart suite" errorDescription="Chunk visual gagal.">
              <Suspense fallback={<ChartSuiteSkeleton />}>
                <QuickVisual data={quickVisual} />
              </Suspense>
            </SectionAsyncBoundary>
          </div>
        </section>

        {/* Pattern */}
        <section key="section-pattern" id="section-pattern" className={sectionClass('section-pattern', 'bg-[var(--panel-muted)]')}>
          <div className={`${shell} space-y-6`}>
            <DailyMetrics
              data={data}
              selectedAccount={dmSelectedAccountValue}
              setSelectedAccount={setDmSelectedAccount}
              rangeDays={dmRangeDays}
              setRangeDays={setDmRangeDays}
            />
            <SectionAsyncBoundary resetKey={asyncResetKey + 1} onReset={retryAsyncSection} loadingTitle="Memuat heatmap" loadingDescription="Agregasi waktu posting." errorTitle="Gagal memuat heatmap" errorDescription="Chunk heatmap gagal.">
              <Suspense fallback={<HeatmapSkeleton />}>
                <Heatmap data={data} />
              </Suspense>
            </SectionAsyncBoundary>
          </div>
        </section>

        {/* Recap */}
        <section key="section-recap" id="section-recap" className={sectionClass('section-recap')}>
          <div className={`${shell} space-y-6`}>
            <ClosingSummary summary={executive} today={today} insights={insights} freshness={freshness} />
            <FreshnessPanel freshness={freshness} />
          </div>
        </section>
      </main>
    </div>
  )
}