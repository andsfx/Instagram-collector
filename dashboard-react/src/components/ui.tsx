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
    <section className="grid gap-[22px] rounded-panel-lg border border-border bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] p-7 shadow-panel-sm backdrop-blur-[16px] max-[720px]:gap-5 max-[720px]:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-1.5">
          {eyebrow ? <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand">{eyebrow}</div> : null}
          <h2 className="m-0 font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">{title}</h2>
          {description ? <p className="m-0 max-w-copy text-[0.95rem] text-text-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: PropsWithChildren) {
  return <div className="rounded-panel-md border border-dashed border-border-strong bg-panel-muted p-6 text-text-muted">{children}</div>
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-panel-md border border-border bg-panel-muted px-5 py-[18px]"
      role="status"
      aria-live="polite"
    >
      <div className="h-3 w-3 rounded-full bg-brand shadow-[0_0_0_8px_color-mix(in_srgb,var(--brand)_14%,transparent)]" aria-hidden="true" />
      <div>
        <div className="font-semibold text-text">{title}</div>
        {description ? <div className="text-sm text-text-muted">{description}</div> : null}
      </div>
    </div>
  )
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-panel-md border border-[color:color-mix(in_srgb,var(--danger)_20%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--panel-muted))] px-5 py-[18px]"
      role="alert"
    >
      <div>
        <div className="font-semibold text-text">{title}</div>
        {description ? <div className="text-sm text-text-muted">{description}</div> : null}
      </div>
    </div>
  )
}
