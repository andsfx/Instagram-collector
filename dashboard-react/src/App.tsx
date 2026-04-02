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
        <section className="grid w-[min(920px,calc(100vw-32px))] gap-5 rounded-panel-lg border border-border bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] p-5 shadow-panel-sm backdrop-blur-[16px] sm:p-7">
          <div className="grid gap-3.5">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_75%,var(--panel)))] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              Competitor Intelligence Brief
            </div>
            <div className="grid max-w-copy gap-2.5">
              <h1 className="m-0 font-display text-[clamp(2rem,1.5rem+1.2vw,2.8rem)] leading-[1.05] tracking-[-0.03em] text-text">Dashboard sedang disiapkan.</h1>
              <p className="m-0 text-base text-text-muted">
                Data runtime sedang divalidasi, dirapikan, dan disusun ke dalam brief analitik
                supaya tampilan pertama tetap terasa stabil.
              </p>
            </div>
          </div>
          <LoadingState
            title="Memuat dashboard React..."
            description="Data sedang divalidasi dan diadaptasi dari endpoint runtime dashboard."
          />
          <div
            className="grid gap-3.5 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_92%,var(--brand-soft)_8%),var(--panel))] p-3.5 sm:p-5"
            aria-hidden="true"
          >
            <div className="min-h-28 animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)),var(--panel-muted))] sm:min-h-[140px]" />
            <div className="grid gap-3.5 sm:grid-cols-[1.4fr_1fr_1fr]">
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)),var(--panel-muted))] sm:min-h-[172px]" />
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)),var(--panel-muted))] sm:min-h-[118px]" />
              <div className="min-h-[92px] animate-pulse rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(90deg,var(--panel-muted),color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)),var(--panel-muted))] sm:min-h-[118px]" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center p-4 sm:p-6">
        <section className="grid w-[min(920px,calc(100vw-32px))] gap-5 rounded-panel-lg border border-[rgba(196,56,78,0.2)] bg-[rgba(255,245,246,0.95)] p-5 shadow-panel-sm backdrop-blur-[16px] sm:p-7">
          <div className="grid gap-3.5">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_75%,var(--panel)))] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              Runtime Data Unavailable
            </div>
            <div className="grid max-w-copy gap-2.5">
              <h1 className="m-0 font-display text-[clamp(2rem,1.5rem+1.2vw,2.8rem)] leading-[1.05] tracking-[-0.03em] text-text">Dashboard belum bisa ditampilkan.</h1>
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
    { id: 'section-visual', label: 'Visual' },
  ]

  return (
    <main id="main-content" className="grid w-full gap-7 px-0 pb-[72px] pt-8 max-[720px]:gap-5 max-[720px]:pb-14 max-[720px]:pt-[18px]">
      <a
        className="absolute left-4 top-4 z-skip -translate-y-[160%] rounded-full bg-brand-strong px-3.5 py-2.5 font-bold text-white no-underline transition focus-visible:translate-y-0"
        href="#section-summary"
      >
        Lewati navigasi dan langsung ke konten
      </a>
      <section className="w-full">
        <div className="mx-auto w-full max-w-shell px-3 max-[720px]:px-2.5">
          <HeaderBar onRefresh={retry} heroMeta={heroMeta} highlights={summaryStrip.slice(0, 3)} />
        </div>
      </section>

      <section className="w-full pt-1">
        <div className="mx-auto w-full max-w-shell px-3 max-[720px]:px-2.5">
          <SectionNav items={sections} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </section>

      <section
        id="section-summary"
        className="w-full scroll-mt-[92px] pt-2"
      >
        <div className="mx-auto grid w-full max-w-shell gap-7 rounded-[32px] border border-[color:color-mix(in_srgb,var(--brand)_10%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_30%,transparent),transparent_34%)] px-3 py-5 max-[720px]:gap-5 max-[720px]:rounded-[24px] max-[720px]:px-2.5 max-[720px]:py-4">
          <ExecutiveSummary summary={executive} />
          <TodaySummary today={today} />
          <SummaryStrip items={summaryStrip} />
          <InsightsPanel insights={insights} />
        </div>
      </section>

      <section id="section-freshness" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
          <FreshnessPanel freshness={freshness} />
        </div>
      </section>

      <section id="section-daily" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
          <DailyMetrics data={data} />
        </div>
      </section>

      <section id="section-ranking" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
          <RankingGrowth data={data} />
        </div>
      </section>

      <section id="section-content" className="w-full scroll-mt-[92px]">
        <div className="mx-auto grid w-full max-w-[1320px] gap-7 px-5 max-[720px]:gap-5 max-[720px]:px-2.5">
          <ContentBreakdown data={data} />
          <PostSnapshot data={data} />
        </div>
      </section>

      <section id="section-overview" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
          <AccountOverviewGrid accounts={accountSummaries} />
        </div>
      </section>

      <section id="section-h2h" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
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

      <section id="section-heatmap" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
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

      <section id="section-visual" className="w-full scroll-mt-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 max-[720px]:px-2.5">
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
