import type { PropsWithChildren } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Empty / loading / error surfaces.
 *
 * The `role`, `aria-live` and copy contracts are the ones the old `states.css`
 * classes carried: `role="status" aria-live="polite"` for loading,
 * `role="alert"` for errors, and the `· HTTP <code>` suffix on the title.
 */

export function EmptyState({ metricName, children }: PropsWithChildren<{ metricName?: string }>) {
  return (
    <Card size="sm" className="bg-muted/40">
      <CardContent className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Kosong</p>
        <p className="text-sm text-muted-foreground">
          {metricName ? `Belum ada data untuk ${metricName}.` : children}
        </p>
      </CardContent>
    </Card>
  )
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-start gap-3 py-2">
      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  description,
  message,
  httpCode,
  onRetry,
}: {
  title?: string
  description?: string
  message?: string
  httpCode?: number
  onRetry?: () => void
}) {
  const displayTitle = title ?? 'Terjadi kesalahan'
  const displayDescription = message ?? description

  return (
    <div role="alert">
      <Card size="sm" className="border-destructive/40">
        <CardContent className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium text-destructive">
              {displayTitle}
              {httpCode != null ? ` · HTTP ${httpCode}` : ''}
            </div>
            {displayDescription ? (
              <div className="text-xs text-muted-foreground">{displayDescription}</div>
            ) : null}
          </div>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Coba lagi
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Desktop/laptop breakpoint reader (the shell switches to a Sheet at 768px).
 * Used by the one table that keeps two DOM branches: DailyMetrics renders a
 * `<table>` above the breakpoint and a card list below it, so only one branch
 * exists in the tree instead of both being hidden with CSS.
 */
export function useTableDesktop() {
  return !useIsMobile()
}
