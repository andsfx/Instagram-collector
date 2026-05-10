import { memo } from 'react'

export type RefreshStatus = 'live' | 'static' | 'cached' | 'loading'

const STATUS_CONFIG: Record<RefreshStatus, { dotClass: string; label: string }> = {
  live: { dotClass: 'bg-[var(--success)] shadow-[0_0_6px_rgba(46,204,113,0.5)] animate-live-pulse', label: 'Live data' },
  static: { dotClass: 'bg-[var(--ig-blue)] shadow-[0_0_6px_rgba(64,93,230,0.5)]', label: 'Snapshot terbaru' },
  cached: { dotClass: 'bg-[var(--ig-orange)] shadow-[0_0_6px_rgba(247,119,55,0.5)]', label: 'Cache lokal' },
  loading: { dotClass: 'bg-[var(--text-soft)]', label: 'Memuat...' },
}

export const RefreshIndicator = memo(function RefreshIndicator({ status }: { status: RefreshStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] shadow-[var(--shadow-sm)]">
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </div>
  )
})