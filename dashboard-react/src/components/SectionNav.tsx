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
  const primaryItems = items.slice(0, 5)
  const secondaryItems = items.slice(5)

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
    <nav className="section-nav" aria-label="Section navigation">
      <div className="section-nav-content">
        <div className="section-nav-links section-nav-links-primary">
          {primaryItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`section-nav-link ${activeId === item.id ? 'is-active' : ''}`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="section-nav-links section-nav-links-desktop">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`section-nav-link ${activeId === item.id ? 'is-active' : ''}`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        {secondaryItems.length ? (
          <label className="section-nav-more" aria-label="Navigasi section tambahan">
            <span className="section-nav-more-label">Lainnya</span>
            <select
              className="section-nav-more-select"
              defaultValue=""
              onChange={(event) => {
                if (!event.target.value) return
                window.location.hash = event.target.value
                event.target.value = ''
              }}
            >
              <option value="">Section lain</option>
              {secondaryItems.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode" aria-pressed={theme === 'dark'}>
          {theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        </button>
      </div>
    </nav>
  )
}
