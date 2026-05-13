import type { HeroMetaItem, HeroSummary } from '../data/selectors'

export function HeaderBar({ onRefresh, heroMeta, copy }: { onRefresh: () => void; heroMeta: HeroMetaItem[]; copy?: HeroSummary }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[image:var(--ig-gradient)] px-5 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-white shadow-[0_2px_8px_rgba(225,48,108,0.3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            Dashboard Intel Kompetitor
          </div>
          <h1 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-extrabold tracking-tight text-[var(--text)]">
            {copy?.title ?? 'Metropolitan Mall Bekasi'}
          </h1>
          <p className="max-w-[600px] text-sm text-[var(--text-muted)]">{copy?.subtitle ?? 'Performance overview'}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {heroMeta.slice(0, 4).map((item) => (
              <div key={item.label} className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-muted)] shadow-[var(--shadow-sm)]">
                <span className="uppercase tracking-wide text-[var(--text-soft)]">{item.label}</span>
                <span className="text-[var(--text)]">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:text-[var(--text)]"
              onClick={onRefresh}
              aria-label="Refresh dashboard data"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/></svg>
              Refresh data
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}