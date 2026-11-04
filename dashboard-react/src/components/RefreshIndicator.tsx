import { memo } from 'react'
import { Badge } from '@/components/ui/badge'

export type RefreshStatus = 'live' | 'static' | 'cached' | 'loading'

const STATUS_CONFIG: Record<RefreshStatus, { dotClass: string; label: string }> = {
  live: { dotClass: 'bg-emerald-600 dark:bg-emerald-400', label: 'Live data' },
  static: { dotClass: 'bg-primary', label: 'Snapshot terbaru' },
  cached: { dotClass: 'bg-amber-600 dark:bg-amber-400', label: 'Cache lokal' },
  loading: { dotClass: 'bg-muted-foreground', label: 'Memuat...' },
}

export const RefreshIndicator = memo(function RefreshIndicator({ status }: { status: RefreshStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" role="status" aria-label={`Data status: ${config.label}`} className="gap-2 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
      <span className={`size-2 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  )
})
