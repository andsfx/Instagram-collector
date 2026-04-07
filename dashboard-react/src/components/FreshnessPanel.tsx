import type { FreshnessSummary } from '../data/selectors'
import { SectionCard } from './ui'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  return (
    <SectionCard
      eyebrow="Status Data"
      title="Konteks update dan sumber data"
      description="Informasi source dan waktu update tetap dipertahankan, tetapi ditata lebih netral agar terasa seperti appendix pembuka presentasi."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Latest Date</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.latestDateLabel}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Tanggal observasi terbaru di dataset dashboard.</div>
        </div>
        <div className="rounded-[22px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Generated</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.generatedAtLabel}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Waktu pembuatan file dashboard yang sedang dibaca aplikasi React.</div>
        </div>
        <div className="rounded-[22px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun Dipantau</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.accountCount}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Total akun yang ikut masuk ke perbandingan dan ranking.</div>
        </div>
        <div className="rounded-[22px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-[18px] shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Histori</div>
          <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-text">{freshness.historyDays} hari</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">Rentang histori yang tersedia untuk membaca tren utama.</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_84%,transparent)] px-2.5 py-1.5 text-xs font-bold text-brand">Sumber: {freshness.sourceLabel}</span>
        <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-bold text-success">Payload tervalidasi zod</span>
        <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1.5 text-xs font-bold text-warning">Data saat ini dibundle ketika build</span>
      </div>
    </SectionCard>
  )
}
