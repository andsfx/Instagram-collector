import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { FreshnessPanel } from './components/FreshnessPanel'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { TodaySummary } from './components/TodaySummary'
import { ReachCard } from './components/ReachCard'
import { useDashboardData } from './hooks/useDashboardData'
import { getAccountSummaries, getExecutiveSummary, getFreshnessSummary, getHeadToHeadDefaults, getInsightsData, getQuickVisualData, getReachSummary, getTodaySummary, getSummaryStrip } from './data/selectors'
import { AccountOverviewGrid } from './components/AccountOverviewGrid'
import { RankingGrowthPresentation } from './components/RankingGrowthPresentation'
import { ContentBreakdownPresentation } from './components/ContentBreakdownPresentation'
import { PostSnapshot } from './components/PostSnapshot'
import { DailyMetrics } from './components/DailyMetrics'
import { SectionNav, type SectionNavItem } from './components/SectionNav'
import { InsightsPanel } from './components/InsightsPanel'
import { useTheme } from './hooks/useTheme'
import { Section } from './components/dashboard/Section'
import { ErrorState } from './components/dashboard/states'
import { SectionAsyncBoundary } from './components/SectionAsyncBoundary'
import { SummaryStrip } from './components/SummaryStrip'
import { ClosingSummary } from './components/ClosingSummary'
import { GrowthSkeleton, HeadToHeadSkeleton, HeatmapSkeleton, ChartSuiteSkeleton, DashboardSkeleton } from './components/SkeletonFallbacks'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { formatInteger } from './utils/formatters'
import type { HeadToHeadMetric } from './data/selectors'

const SECTIONS: SectionNavItem[] = [
  { id: 'section-summary', label: 'Ringkasan' },
  { id: 'section-growth', label: 'Pertumbuhan' },
  { id: 'section-content', label: 'Konten' },
  { id: 'section-comparison', label: 'Perbandingan' },
  { id: 'section-charts', label: 'Grafik' },
  { id: 'section-pattern', label: 'Pola posting' },
  { id: 'section-recap', label: 'Penutup' },
]

const SECTION_LEDE: Record<string, { kicker: string; title: string; note: string }> = {
  'section-summary': { kicker: 'Brief harian', title: 'Ringkasan', note: 'Lima sinyal yang paling cepat menjelaskan posisi brand hari ini.' },
  'section-growth': { kicker: 'Pertumbuhan', title: 'Pergerakan', note: 'Arah followers lintas akun pada jendela terpantau.' },
  'section-content': { kicker: 'Konten', title: 'Komposisi', note: 'Format, tema, dan performa post per akun.' },
  'section-comparison': { kicker: 'Perbandingan', title: 'Posisi', note: 'Tabel kompetitor penuh dan head-to-head dua akun.' },
  'section-charts': { kicker: 'Grafik', title: 'Visual', note: 'Enam figure analitik dari data yang sama.' },
  'section-pattern': { kicker: 'Pola posting', title: 'Ritme', note: 'Riwayat harian dan distribusi jam tayang.' },
  'section-recap': { kicker: 'Penutup', title: 'Catatan', note: 'Ringkasan akhir dan status kesegaran data.' },
}

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

function PageHead({ section, meta }: { section: string; meta?: string }) {
  const lede = SECTION_LEDE[section] ?? SECTION_LEDE['section-summary']
  return (
    <header className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{lede.kicker}</p>
      <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{lede.title}</h1>
      <p className="text-sm text-muted-foreground">{lede.note}</p>
      {meta ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">IG Collector</Badge>
          <span className="text-xs tabular-nums text-muted-foreground">{meta}</span>
        </div>
      ) : null}
    </header>
  )
}

/** Sticky shell used by every branch: nav + top bar + content column. */
function DashboardShell({
  theme,
  onToggleTheme,
  activeSection,
  onSectionChange,
  meta,
  children,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  activeSection: string
  onSectionChange: (id: string) => void
  meta?: { dateLabel: string; accountCount: number; brand: string | null }
  children: React.ReactNode
}) {
  const lede = SECTION_LEDE[activeSection] ?? SECTION_LEDE['section-summary']
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SectionNav
          items={SECTIONS}
          theme={theme}
          onToggleTheme={onToggleTheme}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          meta={meta}
        />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="relative z-50" aria-label="Buka navigasi" />
            <span className="font-heading text-sm font-semibold tracking-tight md:hidden">IG Collector</span>
            <span className="truncate text-sm text-muted-foreground">{lede.title}</span>
          </header>
          <div className="mx-auto w-full max-w-[1160px] px-4 py-6 md:px-8 md:py-10">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function App() {
  const { data, error, loading, retry } = useDashboardData()
  const { theme, toggleTheme } = useTheme()
  const [asyncResetKey, setAsyncResetKey] = useState(0)
  const [activeSection, setActiveSection] = useState('section-summary')

  const headToHeadDefaults = useMemo(() => data ? getHeadToHeadDefaults(data) : { accountA: '', accountB: '', metric: 'followers' as HeadToHeadMetric }, [data])
  const [h2hAccountA, setH2hAccountA] = useState(headToHeadDefaults.accountA)
  const [h2hAccountB, setH2hAccountB] = useState(headToHeadDefaults.accountB)
  const [h2hMetric, setH2hMetric] = useState<HeadToHeadMetric>(headToHeadDefaults.metric)
  const [h2hPresetValue, setH2hPresetValue] = useState('')

  const [dmSelectedAccount, setDmSelectedAccount] = useState<string>(data?.accounts[0] ?? '')
  const [dmRangeDays, setDmRangeDays] = useState<number>(7)
  const accountsKey = data?.accounts.join('\u0000') ?? ''

  useEffect(() => {
    const accounts = data?.accounts ?? []
    if (accounts.length === 0) return
    setH2hAccountA((current) => accounts.includes(current) ? current : accounts[0])
    setH2hAccountB((current) => accounts.includes(current) ? current : accounts[1] ?? accounts[0])
    setDmSelectedAccount((current) => accounts.includes(current) ? current : accounts[0])
  }, [accountsKey, data?.accounts])

  const freshness = useMemo(() => data ? getFreshnessSummary(data) : null, [data])
  const executive = useMemo(() => data ? getExecutiveSummary(data) : null, [data])
  const today = useMemo(() => data ? getTodaySummary(data) : null, [data])
  const reach = useMemo(() => data ? getReachSummary(data) : null, [data])
  const quickVisual = useMemo(() => data ? getQuickVisualData(data) : null, [data])
  const accountSummaries = useMemo(() => data ? getAccountSummaries(data) : [], [data])
  const insights = useMemo(() => data ? getInsightsData(data) : null, [data])
  const summaryStrip = useMemo(() => data ? getSummaryStrip(data) : [], [data])

  const navMeta = useMemo(() => {
    if (!data || !freshness) return undefined
    return {
      dateLabel: freshness.latestDateLabel,
      accountCount: freshness.accountCount,
      brand: data.meta.brandAccount,
    }
  }, [data, freshness])

  const brandFollowers = useMemo(() => {
    if (!data) return null
    const brand = data.meta.brandAccount
    return brand ? data.latest[brand]?.followers ?? null : null
  }, [data])

  function retryAsyncSection() {
    setAsyncResetKey((current) => current + 1)
  }

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id)
    if (window.matchMedia('(max-width: 767px)').matches) {
      document
        .getElementById('dashboard-main')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    }
  }, [])

  if (loading) {
    return (
      <DashboardShell theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} onSectionChange={handleSectionChange}>
        <div className="space-y-2" aria-hidden="true">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Memuat</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight md:text-3xl">Brief</h1>
        </div>
        <div className="mt-8">
          <DashboardSkeleton />
        </div>
      </DashboardShell>
    )
  }

  if (error || !data || !freshness || !executive || !today || !quickVisual || !insights) {
    const httpCodeMatch = error?.match(/\((\d{3})\)/)
    const httpCode = httpCodeMatch ? Number(httpCodeMatch[1]) : undefined

    return (
      <DashboardShell theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} onSectionChange={handleSectionChange}>
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
          <div className="w-full">
            <ErrorState
              title="Data dashboard tidak tersedia"
              message={error ?? 'Gagal memuat data.'}
              httpCode={httpCode}
              onRetry={retry}
            />
          </div>
        </div>
      </DashboardShell>
    )
  }

  const h2hAccountAValue = h2hAccountA || headToHeadDefaults.accountA
  const h2hAccountBValue = h2hAccountB || headToHeadDefaults.accountB
  const dmSelectedAccountValue = dmSelectedAccount || data.accounts[0] || ''

  const sectionVisible = (id: string) => activeSection === id

  return (
    <DashboardShell
      theme={theme}
      onToggleTheme={toggleTheme}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      meta={navMeta}
    >
      <main id="dashboard-main" tabIndex={-1} className="space-y-8 outline-none">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-ring focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
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

        {sectionVisible('section-summary') && (
          <div id="section-summary" className="space-y-8">
            <PageHead section="section-summary" meta={`${freshness.accountCount} akun · ${freshness.latestDateLabel}`} />

            {/* The one loud move: signal plate with the brand's own number */}
            <Card className="border-transparent bg-primary text-primary-foreground">
              <CardContent className="grid items-end gap-6 py-8 md:grid-cols-[1.4fr_1fr] md:py-10">
                <div>
                  <p className="text-xs font-medium text-primary-foreground/80">
                    Posisi brand · @{data.meta.brandAccount}
                  </p>
                  <p className="font-heading text-5xl font-semibold tabular-nums tracking-tight md:text-6xl">
                    {brandFollowers != null ? formatInteger(brandFollowers) : '—'}
                  </p>
                  <p className="mt-2.5 text-sm text-primary-foreground/85">
                    followers · observasi {freshness.latestDateLabel}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="text-xs font-medium text-primary-foreground/80">Brief {freshness.generatedAtLabel}</p>
                  <p className="text-sm leading-relaxed">
                    Satu halaman, tujuh bagian. Sidebar kiri adalah indeks; tiap bagian dibuka sebagai kartu bertanda.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Section index="01" title="Sinyal utama" description="KPI pembuka dan tiga poin yang paling menentukan.">
              <ExecutiveSummary summary={executive} />
            </Section>

            <Section index="02" title="Hari ini" description="Tiga indikator yang paling cepat menjelaskan situasi.">
              <TodaySummary today={today} />
            </Section>

            <Section index="03" title="Audiens" description="Reach dan follower baru dari akun yang tersambung ke Graph.">
              {reach ? <ReachCard summary={reach} /> : null}
            </Section>

            <Section index="04" title="Papan ranking" description="Pemenang tiap metrik pada periode terbaru.">
              <SummaryStrip items={summaryStrip} />
            </Section>

            <Section index="05" title="Catatan keputusan" description="Temuan yang bisa langsung dipakai untuk keputusan mingguan.">
              <InsightsPanel insights={insights} />
            </Section>
          </div>
        )}

        {sectionVisible('section-growth') && (
          <div id="section-growth" className="space-y-8">
            <PageHead section="section-growth" meta={`${quickVisual.followerTrend.length} titik data`} />
            <Section index="01" title="Pergerakan followers" description="Perubahan agregat dan peringkat followers lintas akun.">
              <SectionAsyncBoundary resetKey={asyncResetKey + 3} onReset={retryAsyncSection} loadingTitle="Memuat growth" loadingDescription="Data sedang disiapkan." errorTitle="Gagal memuat" errorDescription="Chunk gagal dimuat.">
                <Suspense fallback={<GrowthSkeleton />}>
                  <FeaturedGrowthChart data={quickVisual} />
                </Suspense>
              </SectionAsyncBoundary>
            </Section>
          </div>
        )}

        {sectionVisible('section-content') && (
          <div id="section-content" className="space-y-8">
            <PageHead section="section-content" meta={`${data.accounts.length} akun`} />
            <Section index="01" title="Komposisi format" description="Format dominan, ER tertinggi, dan sebaran per akun.">
              <ContentBreakdownPresentation data={data} />
            </Section>
            <Section index="02" title="Snapshot post" description="Dua belas post terakhir per akun, bisa difilter dan diurutkan.">
              <PostSnapshot data={data} />
            </Section>
          </div>
        )}

        {sectionVisible('section-comparison') && (
          <div id="section-comparison" className="space-y-8">
            <PageHead section="section-comparison" meta="Tabel + head-to-head" />
            <Section index="01" title="Tabel kompetitor" description="Seluruh akun pada satu tabel yang bisa diurutkan per kolom.">
              <RankingGrowthPresentation data={data} mode="table" />
            </Section>
            <Section index="02" title="Kartu akun" description="Ringkasan cepat tiap akun dalam satu baris sel.">
              <AccountOverviewGrid accounts={accountSummaries} />
            </Section>
            <Section index="03" title="Head-to-head" description="Dua akun, satu metrik, satu verdict.">
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
            </Section>
          </div>
        )}

        {sectionVisible('section-charts') && (
          <div id="section-charts" className="space-y-8">
            <PageHead section="section-charts" meta="6 figure" />
            <Section index="01" title="Visual analytics" description="Tren, ranking, share, radar, dan proyeksi dalam satu grid.">
              <SectionAsyncBoundary resetKey={asyncResetKey + 2} onReset={retryAsyncSection} loadingTitle="Memuat chart suite" loadingDescription="Visual analytics sedang dimuat." errorTitle="Gagal memuat chart suite" errorDescription="Chunk visual gagal.">
                <Suspense fallback={<ChartSuiteSkeleton />}>
                  <QuickVisual data={quickVisual} />
                </Suspense>
              </SectionAsyncBoundary>
            </Section>
          </div>
        )}

        {sectionVisible('section-pattern') && (
          <div id="section-pattern" className="space-y-8">
            <PageHead section="section-pattern" meta={`${dmRangeDays} hari`} />
            <Section index="01" title="Riwayat harian" description="Followers, following, dan jumlah post per hari.">
              <DailyMetrics
                data={data}
                selectedAccount={dmSelectedAccountValue}
                setSelectedAccount={setDmSelectedAccount}
                rangeDays={dmRangeDays}
                setRangeDays={setDmRangeDays}
              />
            </Section>
            <Section index="02" title="Jam tayang" description="Distribusi waktu posting per hari dan slot.">
              <SectionAsyncBoundary resetKey={asyncResetKey + 1} onReset={retryAsyncSection} loadingTitle="Memuat heatmap" loadingDescription="Agregasi waktu posting." errorTitle="Gagal memuat heatmap" errorDescription="Chunk heatmap gagal.">
                <Suspense fallback={<HeatmapSkeleton />}>
                  <Heatmap data={data} />
                </Suspense>
              </SectionAsyncBoundary>
            </Section>
          </div>
        )}

        {sectionVisible('section-recap') && (
          <div id="section-recap" className="space-y-8">
            <PageHead section="section-recap" meta={freshness.generatedAtLabel} />
            <Section index="01" title="Ringkasan penutup" description="Satu paragraf penutup dan temuan pendukung.">
              <ClosingSummary summary={executive} today={today} insights={insights} freshness={freshness} />
            </Section>
            <Section index="02" title="Status data" description="Sumber, kesegaran, dan validasi payload.">
              <FreshnessPanel freshness={freshness} />
            </Section>
          </div>
        )}
      </main>
    </DashboardShell>
  )
}
