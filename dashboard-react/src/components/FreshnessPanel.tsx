import type { FreshnessSummary } from '../data/selectors'
import { SectionCard } from './ui'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  return (
    <SectionCard
      eyebrow="Status Data"
      title="Konteks update dan sumber data"
      description="Panel ini menggantikan status freshness utama dari dashboard legacy dalam format yang lebih padat."
    >
      <div className="meta-grid">
        <div className="stat-card section-card-premium">
          <div className="stat-label">Latest Date</div>
          <div className="stat-value">{freshness.latestDateLabel}</div>
          <div className="stat-detail">Tanggal observasi terbaru di dataset dashboard.</div>
        </div>
        <div className="stat-card section-card-premium">
          <div className="stat-label">Generated</div>
          <div className="stat-value">{freshness.generatedAtLabel}</div>
          <div className="stat-detail">Waktu pembuatan file dashboard yang sedang dibaca aplikasi React.</div>
        </div>
        <div className="stat-card section-card-premium">
          <div className="stat-label">Akun Dipantau</div>
          <div className="stat-value">{freshness.accountCount}</div>
          <div className="stat-detail">Total akun yang ikut masuk ke perbandingan dan ranking.</div>
        </div>
        <div className="stat-card section-card-premium">
          <div className="stat-label">Histori</div>
          <div className="stat-value">{freshness.historyDays} hari</div>
          <div className="stat-detail">Rentang histori yang tersedia untuk membaca tren utama.</div>
        </div>
      </div>
      <div className="badge-row">
        <span className="badge badge-brand">Sumber: {freshness.sourceLabel}</span>
        <span className="badge badge-success">Payload tervalidasi zod</span>
        <span className="badge badge-warning">Data saat ini dibundle ketika build</span>
      </div>
    </SectionCard>
  )
}
