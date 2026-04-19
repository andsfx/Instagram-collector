import { useEffect, useState } from 'react'

export interface SectionNavItem {
  id: string
  label: string
}

export function SectionNav({
  items,
  theme,
  onToggleTheme,
}: {
  items: SectionNavItem[]
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    // Use a single IntersectionObserver for all sections instead of one per section
    const elementToId = new Map<Element, string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = elementToId.get(entry.target)
            if (sectionId) {
              setActiveId(sectionId)
            }
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

    return () => {
      observer.disconnect()
    }
  }, [items])

  return (
    <nav
      className="grid gap-3 border-y border-slate-200/80 bg-white/78 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/72 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      aria-label="Section navigation"
    >
      <div className="grid min-w-0 gap-2">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Presentation chapters
          </div>
          <div className="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
        </div>
        <div className="min-w-0 overflow-x-auto pb-1">
          <div className="inline-flex min-w-max items-center gap-1 pr-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                activeId === item.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
              }`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/92 px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900/86 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
        onClick={onToggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </nav>
  )
}
