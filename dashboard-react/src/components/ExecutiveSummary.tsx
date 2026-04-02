import type { ExecutiveSummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  return (
    <SectionCard
      eyebrow="Executive Summary"
      title="Sorotan utama dari periode terbaru"
      description="Ringkasan KPI ini memindahkan presentasi inti dari legacy ke format yang lebih bersih dan mudah dipindai."
    >
      <div className="grid gap-5 desktop:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <div className="grid gap-[18px] md:grid-cols-2">
          {summary.kpis.map((kpi, index) => (
            <article
              key={kpi.key}
              className={[
                'relative overflow-hidden rounded-panel-md border shadow-panel-sm',
                index === 0
                  ? 'md:col-span-2 border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_62%,transparent),transparent_36%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_74%,var(--panel)),var(--panel))] p-6 shadow-panel-md'
                  : index === 1
                    ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_42%,var(--panel)),var(--panel))] p-[22px]'
                    : 'border-[color:color-mix(in_srgb,var(--border)_96%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_97%,var(--brand-soft)_3%),var(--panel))] p-[18px]',
              ].join(' ')}
            >
              <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{kpi.label}</div>
              <div className={index === 0 ? 'mt-3 font-display text-[clamp(2.2rem,1.7rem+1.05vw,3.2rem)] leading-[0.94] text-brand-strong' : index === 1 ? 'mt-2.5 font-display text-[clamp(1.75rem,1.38rem+0.8vw,2.45rem)] leading-none text-brand-strong' : 'mt-2.5 font-display text-[clamp(1.28rem,1.05rem+0.55vw,1.82rem)] leading-none text-text'}>
                {kpi.value}
              </div>
              <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">
                {kpi.account ? `Akun: @${kpi.account}` : 'Lintas akun / insight agregat'}
              </div>
              {index === 0 ? (
                <div className="mt-4 max-w-[40ch] text-[0.95rem] leading-[1.65] text-text-muted">
                  KPI pembuka ini dirancang jadi titik orientasi pertama sebelum mata turun ke kartu pendukung yang lebih spesifik.
                </div>
              ) : null}
              <div className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[linear-gradient(90deg,var(--brand),color-mix(in_srgb,var(--brand-soft-2)_60%,var(--brand)))] ${index === 0 ? 'w-[120px]' : 'w-[72px]'}`} />
            </article>
          ))}
        </div>
        <aside className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_96%,var(--panel)),color-mix(in_srgb,var(--brand-soft)_10%,var(--panel)))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Interpretasi</div>
          <h3 className="mt-1.5 font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">
            Apa yang paling penting dibaca tim hari ini
          </h3>
          <p className="mt-3 text-[0.9rem] leading-[1.6] text-text-muted">
            Panel ini sengaja dibuat lebih tenang agar pembaca memproses angka utama dulu, baru masuk ke interpretasi naratif.
          </p>
          <ul className="mt-4 list-disc pl-[18px] text-[0.95rem] leading-[1.7] text-text-muted">
            {summary.bullets.map((bullet) => (
              <li key={bullet} className="mt-2">{bullet}</li>
            ))}
          </ul>
        </aside>
      </div>
    </SectionCard>
  )
}
