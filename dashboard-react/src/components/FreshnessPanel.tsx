import type { FreshnessSummary } from '../data/selectors'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  return (
    <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Status Data</h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
        Catatan sumber dan freshness — berfungsi seperti technical footer alih-alih panel dashboard terpisah.
      </p>

      <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Latest Date</p>
          <p className="font-display text-[clamp(1.1rem,1rem+0.3vw,1.4rem)] font-normal tracking-[-0.03em] text-[var(--text)]">{freshness.latestDateLabel}</p>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">Tanggal observasi terbaru di dataset dashboard.</p>
        </div>
        <div className="grid gap-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Generated</p>
          <p className="font-display text-[clamp(1.1rem,1rem+0.3vw,1.4rem)] font-normal tracking-[-0.03em] text-[var(--text)]">{freshness.generatedAtLabel}</p>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">Waktu pembuatan file dashboard yang sedang dibaca aplikasi React.</p>
        </div>
        <div className="grid gap-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Akun Dipantau</p>
          <p className="font-display text-[clamp(1.1rem,1rem+0.3vw,1.4rem)] font-normal tracking-[-0.03em] text-[var(--text)]">{freshness.accountCount}</p>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">Total akun yang ikut masuk ke perbandingan dan ranking.</p>
        </div>
        <div className="grid gap-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Histori</p>
          <p className="font-display text-[clamp(1.1rem,1rem+0.3vw,1.4rem)] font-normal tracking-[-0.03em] text-[var(--text)]">{freshness.historyDays} hari</p>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">Rentang histori yang tersedia untuk membaca tren utama.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 text-xs">
        <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 font-medium text-[var(--text-soft)]" role="status" aria-label={`Data source: ${freshness.sourceLabel}`}>Sumber: {freshness.sourceLabel}</span>
        <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 font-medium text-[var(--success)]" role="status" aria-label="Validation status: payload validated with zod">Payload tervalidasi zod</span>
        <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 font-medium text-[var(--warning)]" role="status" aria-label="Data bundling: data is bundled at build time">Data saat ini dibundle ketika build</span>
      </div>
    </section>
  )
}
