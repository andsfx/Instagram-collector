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
    const observers = items
      .map((item) => {
        const element = document.getElementById(item.id)
        if (!element) return null

        const observer = new IntersectionObserver(
          (entries) => {
            const activeEntry = entries.find((entry) => entry.isIntersecting)
            if (activeEntry) {
              setActiveId(item.id)
            }
          },
          { rootMargin: '-28% 0px -58% 0px', threshold: 0.05 },
        )

        observer.observe(element)
        return observer
      })
      .filter(Boolean) as IntersectionObserver[]

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [items])

  return (
    <nav
      className="flex items-center gap-3 rounded-[1.7rem] border border-white/60 bg-white/84 px-3 py-3 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/76"
      aria-label="Section navigation"
    >
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="flex min-w-max items-center gap-2 pr-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition ${
                activeId === item.id
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:bg-white/6 dark:text-slate-300 dark:hover:bg-white/12 dark:hover:text-white'
              }`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
        onClick={onToggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </nav>
  )
}
