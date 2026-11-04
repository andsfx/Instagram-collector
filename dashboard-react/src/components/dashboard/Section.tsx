import type { PropsWithChildren, ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

/**
 * One numbered section of the dashboard.
 *
 * Replaces the old `.band` header (numeral column + rule + kicker copy) with a
 * heading block: index badge, `h2`, optional description and a right-hand slot
 * for section-level controls.
 */
export function Section({
  index,
  title,
  description,
  aside,
  children,
  id,
}: PropsWithChildren<{
  index: string
  title: string
  description?: string
  aside?: ReactNode
  id?: string
}>) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="secondary" className="tabular-nums" aria-hidden="true">
            {index}
          </Badge>
          <h2 id={id ? `${id}-title` : undefined} className="font-heading text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {aside ? <div className="flex items-center gap-2">{aside}</div> : null}
      </header>
      {children}
    </section>
  )
}
