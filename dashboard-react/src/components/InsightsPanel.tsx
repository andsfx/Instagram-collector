import type { InsightsData } from '../data/selectors'
import { SectionCard } from './ui'

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  return (
    <SectionCard
      eyebrow="Insights"
      title="Rekomendasi cepat untuk membaca situasi kompetitor"
      description="Panel ini memindahkan insight interpretatif dari legacy dashboard ke format rekomendasi yang lebih ringkas dan konsisten."
    >
      <div className="tile-grid">
        {insights.items.map((item) => (
          <article key={item.title} className="insight-tile section-note-card">
            <div className={`badge ${item.tone === 'positive' ? 'badge-success' : item.tone === 'warning' ? 'badge-warning' : item.tone === 'danger' ? 'badge-danger' : 'badge-brand'}`}>
              {item.label}
            </div>
            <h3 className="section-title">{item.title}</h3>
            <p className="section-description">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
