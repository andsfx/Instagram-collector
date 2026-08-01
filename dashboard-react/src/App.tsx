import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeadToHeadDefaults, getInsightsData, getQuickVisualData, getTodaySummary, getSummaryStrip } from './data/selectors'
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
import type { HeadToHeadMetric } from './data/selectors'

const SECTIONS: SectionNavItem[] = [
  { id: 'section-summary', label: 'Summary' },
  { id: 'section-growth', label: 'Growth' },
  { id: 'section-content', label: 'Content' },
  { id: 'section-comparison', label: 'Comparison' },
  { id: 'section-charts', label: 'Charts' },
  { id: 'section-pattern', label: 'Pattern' },
  { id: 'section-recap', label: 'Recap' },
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
  const { data, error, loading, retry } = useDashboardData()
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

  function retryAsyncSection() {
    setAsyncResetKey((current) => current + 1)
  }

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="pt-[56px] min-h-screen lg:pt-[120px]">
          <div className="mx-auto w-full max-w-[1080px] px-6 py-8 lg:px-8">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  if (error || !data || !freshness || !executive || !today || !quickVisual || !insights) {
    // Extract HTTP code from error message if present
    const httpCodeMatch = error?.match(/\((\d{3})\)/)
    const httpCode = httpCodeMatch ? Number(httpCodeMatch[1]) : undefined

    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="pt-[56px] flex min-h-screen items-center justify-center px-6 py-16 lg:pt-[120px]">
          <div className="grid gap-4 text-center">
            <ErrorState
              title="Data dashboard tidak tersedia"
              message={error ?? 'Gagal memuat data.'}
              httpCode={httpCode}
              onRetry={retry}
            />
          </div>
        </main>
      </div>
    )
  }

  const shell = 'mx-auto w-full max-w-[1080px] px-6 lg:px-8'
  const sectionClass = (sectionId: string, background = '') => [
    activeSection === sectionId ? 'block' : 'hidden',
    background,
  ].filter(Boolean).join(' ')
  const h2hAccountAValue = h2hAccountA || headToHeadDefaults.accountA
  const h2hAccountBValue = h2hAccountB || headToHeadDefaults.accountB
  const dmSelectedAccountValue = dmSelectedAccount || data.accounts[0] || ''

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SectionNav items={SECTIONS} theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} onSectionChange={handleSectionChange} />

      <main id="dashboard-main" tabIndex={-1} className="pt-[56px] lg:pt-[120px]">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-[64px] focus:z-50 focus:rounded-[var(--radius-sm)] focus:border focus:border-[var(--border-strong)] focus:bg-[var(--panel)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--text)] focus:shadow-sm lg:focus:top-[128px]"
          href="#dashboard-main"
          onClick={(e) => {
            e.preventDefault()
            const main = document.getElementById('dashboard-main')
            if (main) {
              main.focus()
              main.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
            }
          }}
        >
          Lewati navigasi
        </a>

        <div>
          {/* Growth */}
          <section key="section-growth" id="section-growth" className={sectionClass('section-growth')}>
            <div className={`${shell} py-8 space-y-6`}>
              <SectionAsyncBoundary resetKey={asyncResetKey + 3} onReset={retryAsyncSection} loadingTitle="Memuat growth" loadingDescription="Data sedang disiapkan." errorTitle="Gagal memuat" errorDescription="Chunk gagal dimuat.">
                <Suspense fallback={<GrowthSkeleton />}>
                  <FeaturedGrowthChart data={quickVisual} />
                </Suspense>
              </SectionAsyncBoundary>
            </div>
          </section>

          {/* Summary */}
          <section key="section-summary" id="section-summary" className={sectionClass('section-summary', 'bg-[var(--panel-muted)]')}>
            <div className={`${shell} py-8 space-y-6`}>
              <ExecutiveSummary summary={executive} />
              <TodaySummary today={today} />
              <SummaryStrip items={summaryStrip} />
              <InsightsPanel insights={insights} />
            </div>
          </section>

          {/* Content */}
          <section key="section-content" id="section-content" className={sectionClass('section-content')}>
            <div className={`${shell} py-8 space-y-6`}>
              <ContentBreakdownPresentation data={data} />
              <PostSnapshot data={data} />
            </div>
          </section>

          {/* Comparison */}
          <section key="section-comparison" id="section-comparison" className={sectionClass('section-comparison', 'bg-[var(--panel-muted)]')}>
            <div className={`${shell} py-8 space-y-6`}>
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
            <div className={`${shell} py-8 space-y-6`}>
              <SectionAsyncBoundary resetKey={asyncResetKey + 2} onReset={retryAsyncSection} loadingTitle="Memuat chart suite" loadingDescription="Visual analytics sedang dimuat." errorTitle="Gagal memuat chart suite" errorDescription="Chunk visual gagal.">
                <Suspense fallback={<ChartSuiteSkeleton />}>
                  <QuickVisual data={quickVisual} />
                </Suspense>
              </SectionAsyncBoundary>
            </div>
          </section>

          {/* Pattern */}
          <section key="section-pattern" id="section-pattern" className={sectionClass('section-pattern', 'bg-[var(--panel-muted)]')}>
            <div className={`${shell} py-8 space-y-6`}>
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
            <div className={`${shell} py-8 space-y-6`}>
              <ClosingSummary summary={executive} today={today} insights={insights} freshness={freshness} />
              <FreshnessPanel freshness={freshness} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}