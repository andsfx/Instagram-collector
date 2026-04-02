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
    <section className="panel panel-section section-card">
      <div className="section-header">
        <div className="section-heading">
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-description">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: PropsWithChildren) {
  return <div className="empty-state">{children}</div>
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="state-panel state-loading" role="status" aria-live="polite">
      <div className="state-dot" aria-hidden="true" />
      <div>
        <div className="table-strong">{title}</div>
        {description ? <div className="table-muted">{description}</div> : null}
      </div>
    </div>
  )
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="state-panel state-error" role="alert">
      <div>
        <div className="table-strong">{title}</div>
        {description ? <div className="table-muted">{description}</div> : null}
      </div>
    </div>
  )
}
