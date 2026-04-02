import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard
      eyebrow="Update Hari Ini"
      title={today.title}
      description="Narasi singkat ini mempertahankan flow summary-to-detail dari dashboard legacy tanpa ornamen yang tidak perlu."
      actions={<span className="badge badge-brand">Ref date: {today.referenceDate}</span>}
    >
      <div className="tile-grid">
        {today.items.map((item) => (
          <article key={item.label} className="insight-card">
            <div className="micro-label">{item.label}</div>
            <div className="big-value">{item.value}</div>
            <div className="micro-detail">{item.detail}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
