import type { FreshnessSummary } from '../data/selectors'
import { SectionCard } from './ui'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  return (
    <SectionCard
      eyebrow="Status Data"
      title="Konteks update dan sumber data"
      description="Panel ini menggantikan status freshness utama dari dashboard legacy dalam format yang lebih padat."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Latest Date</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.latestDateLabel}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Tanggal observasi terbaru di dataset dashboard.</div>
        </div>
        <div className="rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Generated</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.generatedAtLabel}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Waktu pembuatan file dashboard yang sedang dibaca aplikasi React.</div>
        </div>
        <div className="rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun Dipantau</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.accountCount}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Total akun yang ikut masuk ke perbandingan dan ranking.</div>
        </div>
        <div className="rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Histori</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.historyDays} hari</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Rentang histori yang tersedia untuk membaca tren utama.</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Sumber: {freshness.sourceLabel}</span>
        <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-bold text-success">Payload tervalidasi zod</span>
        <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1.5 text-xs font-bold text-warning">Data saat ini dibundle ketika build</span>
      </div>
    </SectionCard>
  )
}
