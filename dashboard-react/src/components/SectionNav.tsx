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
  const primaryItems = items.slice(0, 4)
  const secondaryItems = items.slice(4)
  const activeSecondaryId = secondaryItems.some((item) => item.id === activeId) ? activeId : ''
  const navLinkClassName = (isActive: boolean) =>
    [
      'inline-flex min-h-[38px] items-center justify-center whitespace-nowrap rounded-full border px-3 py-[9px] text-[0.82rem] font-semibold transition mobile:text-[0.88rem]',
      isActive
        ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] text-brand shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_8%,transparent)]'
        : 'border-transparent bg-transparent text-text-muted hover:border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] hover:bg-[color:color-mix(in_srgb,var(--panel)_76%,transparent)] hover:text-brand',
    ].join(' ')

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
          { rootMargin: '-30% 0px -55% 0px', threshold: 0.05 },
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
      className="sticky top-3 z-nav bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg)_68%,transparent),transparent)] px-0 py-2 backdrop-blur-[12px]"
      aria-label="Section navigation"
    >
      <div className="grid w-full gap-2 rounded-[24px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel)_92%,transparent))] px-3 py-2.5 shadow-panel-sm mobile:flex mobile:items-center mobile:justify-between mobile:gap-3 mobile:rounded-full mobile:px-3.5 mobile:py-2.5">
        <div className="grid grid-cols-1 items-center gap-2 mobile:hidden">
          <div className="mx-[-4px] flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {primaryItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={navLinkClassName(activeId === item.id)}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
          </div>
        </div>
        <div className="hidden flex-1 gap-2 overflow-x-auto mobile:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={navLinkClassName(activeId === item.id)}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        {secondaryItems.length ? (
          <label className="grid gap-1 mobile:hidden" aria-label="Navigasi section tambahan">
            <select
              className="min-h-[38px] w-full rounded-2xl border border-border bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] px-3 py-2 text-[0.82rem] text-text"
              value={activeSecondaryId}
              onChange={(event) => {
                if (!event.target.value) return
                window.location.hash = event.target.value
              }}
            >
              <option value="">Section lain</option>
              {secondaryItems.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          className="hidden min-h-[38px] items-center justify-center justify-self-end rounded-full border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_82%,transparent)] px-3 py-[9px] text-[0.84rem] font-semibold text-text-muted transition hover:border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] hover:text-brand mobile:inline-flex mobile:px-3.5"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        </button>
      </div>
    </nav>
  )
}
