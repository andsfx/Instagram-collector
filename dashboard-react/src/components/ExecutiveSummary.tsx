import type { ExecutiveSummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  const [leadKpi, ...supportingKpis] = summary.kpis

  return (
    <SectionCard
      eyebrow="Executive Summary"
      title="Sinyal utama brand"
      description="Satu KPI memimpin. Sisanya mendukung keputusan."
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="grid gap-7">
          {leadKpi ? (
            <article className="grid gap-3 border-b border-slate-200/80 pb-6 dark:border-white/10">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {leadKpi.label}
              </div>
              <div className="font-display text-[clamp(3.4rem,3rem+1.3vw,5rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-slate-950 dark:text-white">
                {leadKpi.value}
              </div>
                <div className="max-w-[34rem] text-[0.94rem] leading-6 text-slate-600 dark:text-slate-300">
                  {leadKpi.account ? `@${leadKpi.account} menjadi acuan utama untuk membaca skala kompetisi saat ini.` : 'KPI ini menjadi acuan utama untuk membaca posisi brand.'}
                </div>
            </article>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            {supportingKpis.map((kpi) => (
              <article key={kpi.key} className="grid gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{kpi.label}</div>
                <div className="font-display text-[clamp(1.55rem,1.3rem+0.7vw,2.25rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 dark:text-white">
                  {kpi.value}
                </div>
                <div className="text-[0.92rem] leading-[1.65] text-slate-600 dark:text-slate-300">
                  {kpi.account ? `Akun: @${kpi.account}` : 'Lintas akun / insight agregat'}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-4 border-t border-slate-200/80 pt-6 dark:border-white/10 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Key interpretation</div>
          <h3 className="font-display text-[clamp(1.24rem,1.08rem+0.46vw,1.7rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-slate-950 dark:text-white">
            Apa yang perlu dibawa ke ruang rapat hari ini
          </h3>
          <p className="text-[0.94rem] leading-7 text-slate-600 dark:text-slate-300">
            Baca angka utama lebih dulu, lalu gunakan poin ini untuk menutup pembahasan dengan cepat.
          </p>
          <ul className="grid gap-3 text-[0.95rem] leading-7 text-slate-600 dark:text-slate-300">
            {summary.bullets.map((bullet, index) => (
              <li key={bullet} className="grid grid-cols-[auto_1fr] gap-3 border-t border-slate-200/70 pt-3 first:border-t-0 first:pt-0 dark:border-white/10">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-soft)_28%,white)] text-[0.72rem] font-semibold text-slate-700 dark:bg-[color:color-mix(in_srgb,var(--brand)_16%,transparent)] dark:text-slate-200">
                  {index + 1}
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </SectionCard>
  )
}
