import type { ExecutiveSummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  return (
    <SectionCard
      eyebrow="Executive Summary"
      title="Sorotan utama dari periode terbaru"
      description="Ringkasan KPI ini memindahkan presentasi inti dari legacy ke format yang lebih bersih dan mudah dipindai."
    >
      <div className="insight-grid">
        <div className="summary-grid">
          {summary.kpis.map((kpi) => (
            <article key={kpi.key} className="kpi-card">
              <div className="stat-label">{kpi.label}</div>
              <div className="stat-value">{kpi.value}</div>
              <div className="stat-detail">{kpi.account ? `Akun: @${kpi.account}` : 'Lintas akun / insight agregat'}</div>
            </article>
          ))}
        </div>
        <aside className="insight-card">
          <div className="eyebrow">Interpretasi</div>
          <h3 className="section-title">Apa yang paling penting dibaca tim hari ini</h3>
          <ul className="bullet-list">
            {summary.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </aside>
      </div>
    </SectionCard>
  )
}
