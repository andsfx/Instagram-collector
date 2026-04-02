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
      'inline-flex min-h-[38px] items-center justify-center whitespace-nowrap rounded-full border px-3 py-[9px] text-[0.82rem] font-bold transition mobile:text-[0.88rem]',
      isActive
        ? 'border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_84%,var(--panel)),color-mix(in_srgb,var(--brand-soft-2)_64%,var(--panel)))] text-brand'
        : 'border-transparent bg-transparent text-text-muted hover:border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_84%,var(--panel)),color-mix(in_srgb,var(--brand-soft-2)_64%,var(--panel)))] hover:text-brand',
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
      className="sticky top-3 z-nav bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg)_52%,transparent),transparent)] px-0 py-2 backdrop-blur-[12px]"
      aria-label="Section navigation"
    >
      <div className="grid w-full gap-2 rounded-[24px] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,transparent),color-mix(in_srgb,var(--panel)_88%,transparent))] px-3 py-2.5 shadow-[0_14px_30px_rgba(42,42,42,0.08)] mobile:flex mobile:items-center mobile:justify-between mobile:gap-3.5 mobile:rounded-full mobile:px-3.5 mobile:py-2.5">
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
          className="hidden min-h-[38px] items-center justify-center justify-self-end rounded-full border border-transparent px-3 py-[9px] text-[0.88rem] font-bold text-text-muted transition hover:border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_84%,var(--panel)),color-mix(in_srgb,var(--brand-soft-2)_64%,var(--panel)))] hover:text-brand mobile:inline-flex mobile:px-3.5"
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
