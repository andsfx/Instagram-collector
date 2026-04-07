import { Suspense, lazy, useState, type ReactNode } from 'react'
import { HeaderBar } from './components/HeaderBar'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeroMeta, getInsightsData, getQuickVisualData, getTodaySummary } from './data/selectors'
import { getSummaryStrip } from './data/selectors'
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

function ChapterShell({
  kicker,
  title,
  description,
  tone = 'neutral',
  children,
}: {
  kicker: string
  title: string
  description: string
  tone?: 'neutral' | 'accent'
  children: ReactNode
}) {
  return (
    <div
      className={[
        'relative grid gap-6 border-t px-0 pt-8 sm:gap-7 sm:pt-10 lg:gap-8 lg:pt-12',
        tone === 'accent'
          ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,white)] before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-full before:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_10%,white),transparent_72%)] dark:border-[color:color-mix(in_srgb,var(--brand)_16%,transparent)] dark:before:bg-[linear-gradient(180deg,rgba(51,65,85,0.18),transparent_72%)]'
          : 'border-slate-200/80 dark:border-white/10',
      ].join(' ')}
    >
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] lg:items-end lg:gap-6">
        <div className="grid gap-2">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{kicker}</div>
          <h2 className="font-display text-[clamp(1.3rem,1.08rem+0.5vw,1.7rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-950 dark:text-white">{title}</h2>
        </div>
        <p className="max-w-[44ch] text-[0.92rem] leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      <div className="space-y-5 sm:space-y-6">{children}</div>
    </div>
  )
}

function FeaturedGrowthFallback() {
  return (
    <article className="grid gap-5 rounded-[2rem] border border-[color:color-mix(in_srgb,var(--brand)_16%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,white),rgba(255,255,255,0.94))] p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.32)] dark:border-[color:color-mix(in_srgb,var(--brand)_20%,transparent)] dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.76),rgba(15,23,42,0.54))] sm:p-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-7">
      <div className="grid gap-4">
        <div className="h-3 w-28 rounded-full bg-slate-200/90 dark:bg-white/10" />
        <div className="h-10 w-full max-w-[22rem] rounded-[1.2rem] bg-slate-200/90 dark:bg-white/10" />
        <div className="h-20 w-full max-w-[28rem] rounded-[1.2rem] bg-slate-200/70 dark:bg-white/5" />
      </div>
      <div className="rounded-[1.7rem] border border-white/70 bg-white/92 p-3 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/62 sm:p-4">
        <div className="h-[280px] w-full animate-pulse rounded-[1.2rem] bg-slate-200/80 dark:bg-white/10 sm:h-[340px]" />
      </div>
    </article>
  )
}

export default function App() {
  const { data, error, loading, retry } = useDashboardData()
  const { theme, toggleTheme } = useTheme()
  const [asyncResetKey, setAsyncResetKey] = useState(0)
  const [isVisualAppendixOpen, setIsVisualAppendixOpen] = useState(false)

  function retryAsyncSection() {
    setAsyncResetKey((current) => current + 1)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <LoadingState
          title="Memuat dashboard React..."
          description="Data sedang divalidasi dan diadaptasi dari endpoint runtime dashboard."
        />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <ErrorState title="Data dashboard tidak tersedia" description={error ?? 'Permintaan ke endpoint runtime gagal.'} />
        <div>
          <button
            type="button"
            className="mt-4 inline-flex items-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            onClick={retry}
          >
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
    { id: 'section-growth', label: 'Growth' },
    { id: 'section-summary', label: 'Summary' },
    { id: 'section-content', label: 'Content' },
    { id: 'section-comparison', label: 'Comparison' },
    { id: 'section-pattern', label: 'Pattern' },
    { id: 'section-appendix', label: 'Appendix' },
    { id: 'section-recap', label: 'Recap' },
  ]

  const shell = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'
  const chapterBase = 'relative py-6 sm:py-8 lg:py-10'

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-clip pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.12),transparent_28%)]" />
      <a
        className="absolute left-4 top-4 z-50 -translate-y-16 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg transition focus:translate-y-0 dark:bg-white dark:text-slate-950"
        href="#section-summary"
      >
        Lewati navigasi dan langsung ke konten
      </a>

      <section className="relative">
        <HeaderBar onRefresh={retry} heroMeta={heroMeta} />
      </section>

      <section className="sticky top-0 z-30">
        <div className={`${shell} max-w-[1360px]`}>
          <SectionNav items={sections} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </section>

      <section id="section-growth" className={`${chapterBase} scroll-mt-28`}>
        <div className={`${shell} space-y-5 sm:space-y-6`}>
          <SectionAsyncBoundary
            resetKey={asyncResetKey + 3}
            onReset={retryAsyncSection}
            loadingTitle="Memuat growth comparison"
            loadingDescription="Chart pembuka sedang disiapkan."
            errorTitle="Gagal memuat growth comparison"
            errorDescription="Chunk chart pembuka gagal dimuat."
          >
            <Suspense fallback={<FeaturedGrowthFallback />}>
              <FeaturedGrowthChart data={quickVisual} />
            </Suspense>
          </SectionAsyncBoundary>
          <RankingGrowthPresentation data={data} mode="summary" />
        </div>
      </section>

      <section id="section-summary" className={`${chapterBase} scroll-mt-28`}>
        <div className={shell}>
          <ChapterShell
            kicker="Executive Summary"
            title="Angka utama untuk rapat ini."
            description="Mulai dari KPI inti, lanjut ke pembacaan singkat, lalu keputusan cepat."
            tone="accent"
          >
            <ExecutiveSummary summary={executive} />
            <TodaySummary today={today} />
            <SummaryStrip items={summaryStrip} />
            <InsightsPanel insights={insights} />
          </ChapterShell>
        </div>
      </section>

      <section id="section-content" className={`${chapterBase} scroll-mt-28`}>
        <div className={shell}>
          <ChapterShell
            kicker="Content Performance"
            title="Format, post terbaik, dan bukti performa."
            description="Fokus pada apa yang bekerja, siapa yang memimpin, dan contoh terkuat."
          >
            <ContentBreakdownPresentation data={data} />
            <PostSnapshot data={data} />
          </ChapterShell>
        </div>
      </section>

      <section id="section-comparison" className={`${chapterBase} scroll-mt-28`}>
        <div className={shell}>
          <ChapterShell
            kicker="Comparison"
            title="Bandingkan akun dan gap utama."
            description="Lihat ranking, posisi akun, dan head-to-head dalam satu alur."
          >
            <RankingGrowthPresentation data={data} mode="table" />
            <AccountOverviewGrid accounts={accountSummaries} />
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
          </ChapterShell>
        </div>
      </section>

      <section id="section-pattern" className={`${chapterBase} scroll-mt-28`}>
        <div className={shell}>
          <ChapterShell
            kicker="Pattern & Appendix"
            title="Riwayat harian, waktu posting, dan appendix visual."
            description="Bagian ini untuk detail tambahan. Flow utama tetap ringan."
          >
            <DailyMetrics data={data} />
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
            <SectionAsyncBoundary
              resetKey={asyncResetKey + 2}
              onReset={retryAsyncSection}
              loadingTitle="Memuat chart suite"
              loadingDescription="Visual analytics tambahan sedang di-load terpisah."
              errorTitle="Gagal memuat chart suite"
              errorDescription="Chunk visual analytics gagal dimuat."
            >
              <details
                open={isVisualAppendixOpen}
                onToggle={(event) => setIsVisualAppendixOpen(event.currentTarget.open)}
                className="group border-t border-slate-200/80 pt-5 transition dark:border-white/10"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                  <div className="grid gap-1.5">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Visual appendix</div>
                    <div className="font-display text-[1.18rem] font-semibold leading-[1.04] tracking-[-0.03em] text-slate-950 dark:text-white">
                      Buka chart suite lengkap jika pembahasan perlu turun ke visual pendukung.
                    </div>
                    <p className="max-w-[60ch] text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Projection, engagement, share, radar, dan trend tambahan tetap tersedia, tetapi tidak langsung membebani flow presentasi utama.
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition group-open:bg-slate-950 group-open:text-white dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:group-open:bg-white dark:group-open:text-slate-950">
                    <span className="group-open:hidden">Expand</span>
                    <span className="hidden group-open:inline">Collapse</span>
                  </span>
                </summary>
                {isVisualAppendixOpen ? (
                  <div className="pt-5">
                    <Suspense fallback={<SectionLoadingFallback title="Memuat chart suite" description="Visual analytics tambahan sedang di-load terpisah." />}>
                      <QuickVisual data={quickVisual} />
                    </Suspense>
                  </div>
                ) : null}
              </details>
            </SectionAsyncBoundary>
          </ChapterShell>
        </div>
      </section>

      <section id="section-appendix" className="scroll-mt-28 pb-6 pt-4 sm:pb-10">
        <div className={shell}>
          <FreshnessPanel freshness={freshness} />
        </div>
      </section>

      <section id="section-recap" className="scroll-mt-28 pb-10 pt-4 sm:pb-14">
        <div className={shell}>
          <ClosingSummary summary={executive} today={today} insights={insights} freshness={freshness} />
        </div>
      </section>
    </main>
  )
}
