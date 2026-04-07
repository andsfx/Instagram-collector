import type { ExecutiveSummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  return (
    <SectionCard
      eyebrow="Executive Summary"
      title="Empat sinyal pembuka untuk membaca posisi brand"
      description="Fold pertama difokuskan untuk direksi: angka utama dibaca lebih dulu, lalu interpretasi naratif dan poin pendukung mengikuti di bawahnya."
    >
      <div className="grid gap-5 desktop:grid-cols-[minmax(0,1.72fr)_minmax(300px,0.78fr)]">
        <div className="grid gap-[18px] md:grid-cols-2">
          {summary.kpis.map((kpi, index) => (
            <article
              key={kpi.key}
              className={[
                'relative overflow-hidden rounded-[24px] border shadow-panel-sm',
                index === 0
                  ? 'md:col-span-2 border-[color:color-mix(in_srgb,var(--brand)_22%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_56%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--panel)_99%,transparent),color-mix(in_srgb,var(--brand-soft)_68%,var(--panel)))] p-7 shadow-[0_24px_44px_color-mix(in_srgb,var(--brand)_12%,transparent)]'
                  : index === 1
                    ? 'border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,var(--panel)),var(--panel))] p-[22px]'
                    : 'border-[color:color-mix(in_srgb,var(--border)_96%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,transparent),color-mix(in_srgb,var(--panel-muted)_78%,transparent))] p-[18px]',
              ].join(' ')}
            >
              <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{kpi.label}</div>
              <div className={index === 0 ? 'mt-3 font-display text-[clamp(2.65rem,2rem+1.2vw,3.65rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-text' : index === 1 ? 'mt-2.5 font-display text-[clamp(1.75rem,1.38rem+0.8vw,2.45rem)] font-semibold leading-none text-brand-strong' : 'mt-2.5 font-display text-[clamp(1.28rem,1.05rem+0.55vw,1.82rem)] font-semibold leading-none text-text'}>
                {kpi.value}
              </div>
              <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">
                {kpi.account ? `Akun: @${kpi.account}` : 'Lintas akun / insight agregat'}
              </div>
              {index === 0 ? (
                <div className="mt-4 max-w-[40ch] text-[0.95rem] leading-[1.65] text-text-muted">
                  KPI pembuka ini menjadi headline numerik utama sebelum pembaca berpindah ke metrik pembanding dan konteks pendukung.
                </div>
              ) : null}
              <div className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand))] ${index === 0 ? 'w-[120px]' : 'w-[72px]'}`} />
            </article>
          ))}
        </div>
        <aside className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_70%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-6">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Key interpretation</div>
          <h3 className="mt-1.5 font-display text-[clamp(1.16rem,1rem+0.55vw,1.58rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
            Apa yang perlu dibawa ke ruang rapat hari ini
          </h3>
          <p className="mt-3 text-[0.9rem] leading-[1.6] text-text-muted">
            Panel ini sengaja dibuat lebih tenang agar urutan baca tetap jelas: headline KPI dulu, baru narasi yang menjelaskan implikasinya.
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
