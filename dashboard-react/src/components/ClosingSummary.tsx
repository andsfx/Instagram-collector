import type { ExecutiveSummaryData, FreshnessSummary, InsightsData, TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ClosingSummary({
  summary,
  today,
  insights,
  freshness,
}: {
  summary: ExecutiveSummaryData
  today: TodaySummaryData
  insights: InsightsData
  freshness: FreshnessSummary
}) {
  return (
    <SectionCard
      eyebrow="Closing Summary"
      title="Ringkasan penutup"
      description="Tutup presentasi dengan angka utama, insight inti, dan konteks data."
      actions={
        <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          Ref: {today.referenceDate}
        </span>
      }
    >
      <div className="grid gap-5 border-t border-slate-200/80 pt-6 dark:border-white/10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-8">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            {summary.kpis.slice(0, 3).map((kpi) => (
              <article key={kpi.key} className="grid gap-1.5">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{kpi.label}</div>
                <div className="font-display text-[clamp(1.45rem,1.2rem+0.6vw,1.95rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-slate-950 dark:text-white">
                  {kpi.value}
                </div>
                <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">
                  {kpi.account ? `Akun: @${kpi.account}` : 'Lintas akun / insight agregat'}
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
            {insights.items.slice(0, 3).map((item, index) => (
              <div key={item.title} className="grid grid-cols-[auto_1fr] gap-3 border-b border-slate-200/70 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-soft)_28%,white)] text-[0.72rem] font-semibold text-slate-700 dark:bg-[color:color-mix(in_srgb,var(--brand)_16%,transparent)] dark:text-slate-200">
                  {index + 1}
                </span>
                <div className="grid gap-1">
                  <div className="font-medium text-slate-950 dark:text-white">{item.title}</div>
                  <div className="text-[0.92rem] leading-6 text-slate-600 dark:text-slate-300">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Closing note</div>
          <div className="font-display text-[clamp(1.2rem,1.05rem+0.42vw,1.6rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 dark:text-white">
            Tutup dengan posisi brand, kualitas interaksi, dan konteks data.
          </div>
          <div className="text-[0.92rem] leading-6 text-slate-600 dark:text-slate-300">
            Generated {freshness.generatedAtLabel} dengan observasi terbaru {freshness.latestDateLabel}. Kembali ke bagian ini saat perlu menutup pembahasan dengan cepat.
          </div>
        </aside>
      </div>
    </SectionCard>
  )
}
