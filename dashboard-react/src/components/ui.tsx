import type { PropsWithChildren, ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  eyebrow,
  actions,
  children,
}: PropsWithChildren<{
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}>) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          {eyebrow ? (
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ig-gradient-soft)]">
                <div className="h-2 w-2 rounded-full bg-[var(--brand)]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--text-soft)]">{eyebrow}</span>
            </div>
          ) : null}
          <h2 className="font-display text-lg font-bold tracking-tight text-[var(--text)]">{title}</h2>
          {description ? <p className="max-w-[50ch] text-sm text-[var(--text-muted)]">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: PropsWithChildren) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--panel-muted)] px-5 py-6 text-sm text-[var(--text-muted)]">
      {children}
    </div>
  )
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] px-5 py-4 shadow-[var(--shadow-sm)]" role="status" aria-live="polite">
      <div className="mt-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--brand)]" aria-hidden="true" />
      <div className="grid gap-1">
        <div className="text-sm font-bold text-[var(--text)]">{title}</div>
        {description ? <div className="text-xs text-[var(--text-muted)]">{description}</div> : null}
      </div>
    </div>
  )
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-5 py-4 shadow-[var(--shadow-sm)]" role="alert">
      <div className="grid gap-1">
        <div className="text-sm font-bold text-[var(--danger)]">{title}</div>
        {description ? <div className="text-xs text-[var(--text-muted)]">{description}</div> : null}
      </div>
    </div>
  )
}