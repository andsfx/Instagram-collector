import { useEffect, useState } from 'react'
import { PeriodFilter, type Period } from './PeriodFilter'
import { RefreshIndicator, type RefreshStatus } from './RefreshIndicator'

export interface SectionNavItem {
  id: string
  label: string
}

export function SectionNav({
  items,
  theme,
  onToggleTheme,
  period,
  onPeriodChange,
  refreshStatus,
}: {
  items: SectionNavItem[]
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  period: Period
  onPeriodChange: (p: Period) => void
  refreshStatus: RefreshStatus
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const elementToId = new Map<Element, string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = elementToId.get(entry.target)
            if (sectionId) setActiveId(sectionId)
          }
        }
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: 0.05 },
    )
    for (const item of items) {
      const element = document.getElementById(item.id)
      if (element) {
        elementToId.set(element, item.id)
        observer.observe(element)
      }
    }
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      className="border-b border-[var(--border)] bg-[color:var(--panel)] backdrop-blur-xl transition-shadow"
      aria-label="Section navigation"
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`whitespace-nowrap rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-all ${
                activeId === item.id
                  ? 'bg-[image:var(--ig-gradient)] text-white shadow-[0_2px_10px_rgba(225,48,108,0.25)]'
                  : 'text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--panel-muted)]'
              }`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={onPeriodChange} />
          <RefreshIndicator status={refreshStatus} />
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] px-3 text-[11px] font-bold uppercase tracking-wide text-[var(--text-soft)] transition hover:text-[var(--text)] hover:border-[var(--border-strong)]"
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}