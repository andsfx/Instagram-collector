import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * KPI block: micro label, numeral, optional note.
 * Replaces the former `.stat` / `.stat-label` / `.stat-value` / `.stat-note` rules.
 */
export function Stat({
  label,
  value,
  note,
  size = 'md',
  account,
  className,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'handle'
  account?: string | null
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
        {account ? ` · @${account}` : ''}
      </p>
      <p
        className={cn(
          'font-heading font-semibold tabular-nums tracking-tight break-words',
          size === 'lg' && 'text-4xl font-semibold md:text-5xl',
          size === 'md' && 'text-2xl',
          size === 'sm' && 'text-xl',
          size === 'handle' && 'text-base break-all md:text-lg',
        )}
      >
        {value}
      </p>
      {note ? <p className="max-w-[46ch] text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  )
}
