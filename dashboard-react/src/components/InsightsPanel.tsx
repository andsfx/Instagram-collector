import type { InsightsData } from '../data/selectors'
import { SectionCard } from './ui'

function toneClass(tone: InsightsData['items'][number]['tone']) {
  if (tone === 'positive') return 'bg-success-soft text-success'
  if (tone === 'warning') return 'bg-warning-soft text-warning'
  if (tone === 'danger') return 'bg-danger-soft text-danger'
  return 'bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] text-brand'
}

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  return (
    <SectionCard
      eyebrow="Insights"
      title="Rekomendasi cepat untuk membaca situasi kompetitor"
      description="Panel ini merangkum insight interpretatif ke format rekomendasi yang lebih ringkas dan konsisten."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.items.map((item) => (
          <article
            key={item.title}
            className="grid gap-3 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_78%,var(--panel)),var(--panel))] p-[18px] shadow-panel-sm"
          >
            <div className={`inline-flex w-fit items-center rounded-full px-2.5 py-1.5 text-xs font-bold ${toneClass(item.tone)}`}>
              {item.label}
            </div>
            <h3 className="font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">{item.title}</h3>
            <p className="text-[0.95rem] leading-[1.65] text-text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
