import type { InsightsData } from '../data/selectors'
import { SectionCard } from './ui'

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  return (
    <SectionCard
      eyebrow="Insights"
      title="Rekomendasi cepat untuk membaca situasi kompetitor"
      description="Chapter ini berfungsi sebagai jembatan dari angka ke keputusan, jadi treatment-nya lebih ringan dan lebih tenang daripada panel KPI."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {insights.items.map((item) => (
          <article key={item.title} className="grid gap-3 rounded-[1.5rem] border border-slate-200/80 bg-white/72 p-5 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-slate-950/44">
            <div className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[0.72rem] font-semibold ${
              item.tone === 'positive' ? 'bg-success-soft text-success' : item.tone === 'warning' ? 'bg-warning-soft text-warning' : item.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand'
            }`}>
              {item.label}
            </div>
            <h3 className="font-display text-[1.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-950 dark:text-white">{item.title}</h3>
            <p className="text-[0.94rem] leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
