import type { ReachSummaryData } from '../data/selectors'
import { EmptyState, SectionCard } from './ui'
import { formatDate, formatInteger } from '../utils/formatters'

/**
 * Kartu reach + follower baru harian.
 * Hanya akun yang tersambung ke Instagram Graph yang punya angka; sisanya
 * disebut di footer supaya gap-nya kelihatan, bukan disembunyikan.
 */
export function ReachCard({ summary }: { summary: ReachSummaryData }) {
  if (!summary.rows.length) {
    return (
      <SectionCard
        eyebrow="Audiens"
        title="Reach & follower baru"
        description="Metrik ini hanya tersedia untuk akun yang tersambung ke Instagram Graph resmi."
      >
        <EmptyState>
          Belum ada data reach. Angka muncul setelah insight Instagram tersedia (mundur satu hari).
        </EmptyState>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      eyebrow={`Audiens · ${formatDate(summary.date)}`}
      title="Reach & follower baru"
      description="Jumlah akun unik yang melihat konten dan follower baru pada hari itu."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {summary.rows.map((row) => (
          <article
            key={row.account}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">
              @{row.account}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Reach</div>
                <div className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
                  {row.reach == null ? '-' : formatInteger(row.reach)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Follower baru</div>
                <div className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
                  {row.newFollowers == null ? '-' : formatInteger(row.newFollowers)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {summary.missing.length ? (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Tanpa data Graph: {summary.missing.map((account) => `@${account}`).join(', ')}. Akun ini belum
          tersambung ke Instagram Graph, jadi hanya punya angka follower harian.
        </p>
      ) : null}
    </SectionCard>
  )
}
