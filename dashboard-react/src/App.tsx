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
      <main className="grid min-h-screen place-items-center p-4 sm:p-6">
        <section className="grid w-[min(960px,calc(100vw-32px))] gap-5 rounded-[32px] border border-border bg-[color:color-mix(in_srgb,var(--panel)_96%,transparent)] p-5 shadow-panel-md backdrop-blur-[18px] sm:p-7">
          <div className="grid gap-3.5">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_84%,transparent)] px-3.5 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
              Preparing board view
            </div>
            <div className="grid max-w-copy gap-2.5">
              <h1 className="m-0 font-display text-[clamp(2rem,1.5rem+1.2vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-text">Dashboard sedang disiapkan.</h1>
              <p className="m-0 text-base text-text-muted">
                Data runtime sedang divalidasi dan disusun ke format presentasi yang lebih bersih
                agar tampilan pertama tetap stabil saat dibuka.
              </p>
            </div>
          </div>
          <LoadingState
            title="Memuat dashboard React..."
            description="Data sedang divalidasi dan diadaptasi dari endpoint runtime dashboard."
          />
          <div
            className="grid gap-3.5 rounded-[24px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_92%,transparent))] p-3.5 sm:p-5"
            aria-hidden="true"
          >
            <div className="min-h-28 animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_35%,var(--panel)),var(--panel-muted))] sm:min-h-[140px]" />
            <div className="grid gap-3.5 sm:grid-cols-[1.4fr_1fr_1fr]">
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_35%,var(--panel)),var(--panel-muted))] sm:min-h-[172px]" />
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_35%,var(--panel)),var(--panel-muted))] sm:min-h-[118px]" />
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_35%,var(--panel)),var(--panel-muted))] sm:min-h-[118px]" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center p-4 sm:p-6">
        <section className="grid w-[min(960px,calc(100vw-32px))] gap-5 rounded-[32px] border border-[color:color-mix(in_srgb,var(--danger)_26%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_94%,white)] p-5 shadow-panel-md backdrop-blur-[18px] sm:p-7">
          <div className="grid gap-3.5">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--danger)_22%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--panel))] px-3.5 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-danger">
              Runtime Data Unavailable
            </div>
            <div className="grid max-w-copy gap-2.5">
              <h1 className="m-0 font-display text-[clamp(2rem,1.5rem+1.2vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-text">Dashboard belum bisa ditampilkan.</h1>
              <p className="m-0 text-base text-text-muted">
                Endpoint runtime belum mengembalikan payload yang valid, jadi shell utama
                ditahan dulu agar pengguna tidak masuk ke tampilan yang terputus.
              </p>
            </div>
          </div>
          <ErrorState title="Data dashboard tidak tersedia" description={error ?? 'Permintaan ke endpoint runtime gagal.'} />
          <div>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-brand-soft px-3.5 py-2.5 font-bold text-brand transition hover:-translate-y-px"
              onClick={retry}
            >
              Coba ambil ulang data
            </button>
          </div>
        </section>
      </main>
    )
  }

  const heroData = {
    heroMeta: getHeroMeta(data),
    highlights: getSummaryStrip(data),
  }

  const growthSectionData = {
    quickVisual: getQuickVisualData(data),
    data,
  }

  const summarySectionData = {
    executive: getExecutiveSummary(data),
    today: getTodaySummary(data),
    insights: getInsightsData(data),
    summaryStrip: heroData.highlights,
  }

  const comparisonSectionData = {
    accountSummaries: getAccountSummaries(data),
    data,
  }

  const patternSectionData = {
    data,
  }

  const appendixSectionData = {
    freshness: getFreshnessSummary(data),
  }

  const sections: SectionNavItem[] = [
    { id: 'section-growth', label: 'Growth' },
    { id: 'section-summary', label: 'Summary' },
    { id: 'section-content', label: 'Content' },
    { id: 'section-comparison', label: 'Comparison' },
    { id: 'section-pattern', label: 'Pattern' },
    { id: 'section-appendix', label: 'Appendix' },
  ]

  return (
    <main id="main-content" className="grid w-full gap-8 px-0 pb-[72px] pt-6 max-[720px]:gap-5 max-[720px]:pb-14 max-[720px]:pt-[18px]">
      <a
        className="absolute left-4 top-4 z-skip -translate-y-[160%] rounded-full bg-brand-strong px-3.5 py-2.5 font-bold text-white no-underline transition focus-visible:translate-y-0"
        href="#section-summary"
      >
        Lewati navigasi dan langsung ke konten
      </a>
      <section className="w-full">
        <div className="mx-auto w-full max-w-shell px-3 max-[720px]:px-2.5">
          <HeaderBar onRefresh={retry} heroMeta={heroData.heroMeta} highlights={heroData.highlights.slice(0, 3)} />
        </div>
      </section>

      <section className="w-full pt-1.5">
        <div className="mx-auto w-full max-w-shell px-3 max-[720px]:px-2.5">
          <SectionNav items={sections} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </section>

      <section
        id="section-growth"
        className="w-full scroll-mt-[92px] pt-3"
      >
        <div className="mx-auto grid w-full max-w-shell gap-7 rounded-[34px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_56%,transparent),color-mix(in_srgb,var(--brand-soft)_12%,transparent)_48%,transparent)] px-3 py-5 shadow-panel-sm max-[720px]:gap-5 max-[720px]:rounded-[26px] max-[720px]:px-2.5 max-[720px]:py-3.5">
          <SectionAsyncBoundary
            resetKey={asyncResetKey + 2}
            onReset={retryAsyncSection}
            loadingTitle="Memuat chart suite"
            loadingDescription="Visual analytics tambahan sedang di-load terpisah."
            errorTitle="Gagal memuat chart suite"
            errorDescription="Chunk visual analytics gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat chart suite" description="Visual analytics tambahan sedang di-load terpisah." />}>
              <QuickVisual data={growthSectionData.quickVisual} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>

      <section id="section-summary" className="w-full scroll-mt-[92px] pt-2">
        <div className="mx-auto grid w-full max-w-shell gap-7 rounded-[30px] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_24%,transparent),transparent_32%)] px-3 py-4 max-[720px]:gap-5 max-[720px]:rounded-[24px] max-[720px]:px-2.5 max-[720px]:py-3">
          <ExecutiveSummary summary={summarySectionData.executive} />
          <TodaySummary today={summarySectionData.today} />
          <SummaryStrip items={summarySectionData.summaryStrip} />
          <InsightsPanel insights={summarySectionData.insights} />
        </div>
      </section>

      <section id="section-content" className="w-full scroll-mt-[92px] pt-2">
        <div className="mx-auto grid w-full max-w-shell gap-7 rounded-[32px] border border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_52%,transparent),transparent_55%)] px-5 py-5 max-[720px]:gap-5 max-[720px]:rounded-[24px] max-[720px]:px-2.5 max-[720px]:py-3.5">
          <ContentBreakdown data={data} />
          <PostSnapshot data={data} />
        </div>
      </section>

      <section id="section-comparison" className="w-full scroll-mt-[92px] pt-1">
        <div className="mx-auto grid w-full max-w-[1320px] gap-7 px-5 max-[720px]:gap-5 max-[720px]:px-2.5">
          <RankingGrowth data={growthSectionData.data} />
          <AccountOverviewGrid accounts={comparisonSectionData.accountSummaries} />
          <SectionAsyncBoundary
            resetKey={asyncResetKey}
            onReset={retryAsyncSection}
            loadingTitle="Memuat perbandingan akun"
            loadingDescription="Head-to-head sedang disiapkan."
            errorTitle="Gagal memuat head-to-head"
            errorDescription="Chunk section perbandingan akun gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat perbandingan akun" description="Head-to-head sedang disiapkan." />}>
              <HeadToHead data={comparisonSectionData.data} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>

      <section id="section-pattern" className="w-full scroll-mt-[92px] pt-2">
        <div className="mx-auto grid w-full max-w-shell gap-7 rounded-[30px] border border-[color:color-mix(in_srgb,var(--border)_78%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_44%,transparent),transparent_58%)] px-5 py-5 max-[720px]:gap-5 max-[720px]:rounded-[24px] max-[720px]:px-2.5 max-[720px]:py-3.5">
          <DailyMetrics data={patternSectionData.data} />
          <SectionAsyncBoundary
            resetKey={asyncResetKey + 1}
            onReset={retryAsyncSection}
            loadingTitle="Memuat heatmap waktu posting"
            loadingDescription="Agregasi slot waktu sedang dihitung."
            errorTitle="Gagal memuat heatmap"
            errorDescription="Chunk heatmap gagal dimuat."
          >
            <Suspense fallback={<SectionLoadingFallback title="Memuat heatmap waktu posting" description="Agregasi slot waktu sedang dihitung." />}>
              <Heatmap data={patternSectionData.data} />
            </Suspense>
          </SectionAsyncBoundary>
        </div>
      </section>

      <section id="section-appendix" className="w-full scroll-mt-[92px] pt-1">
        <div className="mx-auto w-full max-w-[1240px] px-5 max-[720px]:px-2.5">
          <FreshnessPanel freshness={appendixSectionData.freshness} />
        </div>
      </section>
    </main>
  )
}
