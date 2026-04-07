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
    <section className="grid gap-6 border-t border-slate-200/90 pt-6 dark:border-white/10 sm:gap-7 sm:pt-7 lg:gap-8 lg:pt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          {eyebrow ? (
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="font-display text-[clamp(1.24rem,1.02rem+0.48vw,1.72rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-950 dark:text-white">
            {title}
          </h2>
          {description ? <p className="max-w-[58ch] text-[0.92rem] leading-6 text-slate-600 dark:text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: PropsWithChildren) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      {children}
    </div>
  )
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-start gap-4 rounded-[1.75rem] border border-slate-200 bg-white/90 px-5 py-5 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/70" role="status" aria-live="polite">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
      <div className="grid gap-1.5">
        <div className="text-base font-semibold text-slate-950 dark:text-white">{title}</div>
        {description ? <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</div> : null}
      </div>
    </div>
  )
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/90 px-5 py-5 shadow-[0_20px_60px_-44px_rgba(190,24,93,0.2)] dark:border-rose-500/20 dark:bg-rose-500/10" role="alert">
      <div className="grid gap-1.5">
        <div className="text-base font-semibold text-rose-900 dark:text-rose-100">{title}</div>
        {description ? <div className="text-sm leading-6 text-rose-700 dark:text-rose-200/85">{description}</div> : null}
      </div>
    </div>
  )
}
