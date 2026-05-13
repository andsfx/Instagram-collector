import type { FreshnessSummary } from '../data/selectors'
import { SectionCard } from './ui'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  return (
    <SectionCard
      eyebrow="Status Data"
      title="Konteks update dan sumber data"
      description="Appendix ini diringankan menjadi catatan sumber dan freshness, jadi berfungsi seperti technical footer alih-alih panel dashboard terpisah."
    >
      <div className="grid gap-4 border-t border-slate-200/80 pt-5 dark:border-white/10 md:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Latest Date</div>
          <div className="font-display text-[clamp(1.2rem,1.04rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{freshness.latestDateLabel}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Tanggal observasi terbaru di dataset dashboard.</div>
        </div>
        <div className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Generated</div>
          <div className="font-display text-[clamp(1.2rem,1.04rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{freshness.generatedAtLabel}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Waktu pembuatan file dashboard yang sedang dibaca aplikasi React.</div>
        </div>
        <div className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Akun Dipantau</div>
          <div className="font-display text-[clamp(1.2rem,1.04rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{freshness.accountCount}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Total akun yang ikut masuk ke perbandingan dan ranking.</div>
        </div>
        <div className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Histori</div>
          <div className="font-display text-[clamp(1.2rem,1.04rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{freshness.historyDays} hari</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Rentang histori yang tersedia untuk membaca tren utama.</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-5 dark:border-white/10">
        <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand" role="status" aria-label={`Data source: ${freshness.sourceLabel}`}>Sumber: {freshness.sourceLabel}</span>
        <span className="inline-flex items-center rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success" role="status" aria-label="Validation status: payload validated with zod">Payload tervalidasi zod</span>
        <span className="inline-flex items-center rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning" role="status" aria-label="Data bundling: data is bundled at build time">Data saat ini dibundle ketika build</span>
      </div>
    </SectionCard>
  )
}
