import { memo, useCallback, useEffect, useRef, useState } from 'react'
import FocusTrap from 'focus-trap-react'

export interface SectionNavItem {
  id: string
  label: string
  description?: string
}

const SECTION_ICONS: Record<string, string> = {
  'section-growth': 'M23 6l-9.5 9.5-5-5L1 18',
  'section-summary': 'M4 6h16M4 12h16M4 18h10',
  'section-content': 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  'section-comparison': 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M20 8v6M23 11h-6',
  'section-charts': 'M18 20V10M12 20V4M6 20V14',
  'section-pattern': 'M3 3h18v18H3zM3 9h18M9 21V9',
  'section-recap': 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
}

function SectionNavBase({
  items,
  theme,
  onToggleTheme,
  activeSection,
  onSectionChange,
}: {
  items: SectionNavItem[]
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const wasMobileOpenRef = useRef(false)

  useEffect(() => {
    if (!mobileOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen && wasMobileOpenRef.current) {
      hamburgerRef.current?.focus()
    }
    wasMobileOpenRef.current = mobileOpen
  }, [mobileOpen])

  function handleNavClick(id: string) {
    onSectionChange(id)
    setMobileOpen(false)
  }

  const handleNavKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const container = event.currentTarget.closest('[role="tablist"]')
    const buttons = container?.querySelectorAll<HTMLButtonElement>('button[data-nav-item]')
    if (!buttons || buttons.length === 0) return

    let targetIndex: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        targetIndex = (index + 1) % buttons.length
        break
      case 'ArrowLeft':
        event.preventDefault()
        targetIndex = (index - 1 + buttons.length) % buttons.length
        break
      case 'Home':
        event.preventDefault()
        targetIndex = 0
        break
      case 'End':
        event.preventDefault()
        targetIndex = buttons.length - 1
        break
    }

    if (targetIndex !== null) {
      buttons[targetIndex].focus()
    }
  }, [])

  const issueDate = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const tabContent = (
    <div className="flex items-center gap-1" role="tablist" aria-label="Dashboard sections">
      {items.map((item, index) => {
        const iconPath = SECTION_ICONS[item.id] || 'M4 6h16M4 12h16M4 18h16'
        const isActive = activeSection === item.id
        return (
          <button
            key={item.id}
            type="button"
            data-nav-item
            role="tab"
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleNavClick(item.id)}
            onKeyDown={(e) => handleNavKeyDown(e, index)}
            aria-label={`Navigasi ke ${item.label}`}
            aria-selected={isActive}
            aria-current={isActive ? 'location' : undefined}
            className={`section-tab ${isActive ? 'is-active' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
              <path d={iconPath} />
            </svg>
            <span className="hidden sm:inline">{item.label}</span>
            <span className="section-tab-underline" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )

  const drawerContent = (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <div className="grid">
          <span className="drawer-section-title">IG Dashboard</span>
          <span className="mobile-masthead-issue">EDISI · {issueDate} WIB</span>
        </div>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-soft)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text)]" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => {
            const iconPath = SECTION_ICONS[item.id] || 'M4 6h16M4 12h16M4 18h16'
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                data-nav-item
                onClick={() => handleNavClick(item.id)}
                onKeyDown={(e) => handleNavKeyDown(e, index)}
                aria-label={`Navigasi ke ${item.label}`}
                aria-current={isActive ? 'location' : undefined}
                className={`drawer-item ${isActive ? 'is-active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
                  <path d={iconPath} />
                </svg>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-soft)] transition hover:text-[var(--text)] hover:border-[var(--border-strong)]"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={theme === 'dark'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {theme === 'dark'
              ? <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              : <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
            }
          </svg>
          {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop N6 masthead (lg+) */}
      <header className="newsprint-masthead hidden lg:block">
        <div className="issue-row">
          <span>EDISI · {issueDate} WIB</span>
          <span className="hidden xl:inline">BRIEF HARIAN · METMALBEKASI</span>
        </div>
        <div className="wordmark-row">
          <span className="wordmark">IG Dashboard</span>
        </div>
        <div className="newsprint-double-rule" aria-hidden="true" />
        <div className="section-row">{tabContent}</div>
      </header>

      {/* Mobile collapsed masthead (<lg) */}
      <div className="mobile-masthead lg:hidden">
        <div className="grid gap-0.5">
          <span className="mobile-masthead-wordmark">IG Dashboard</span>
          <span className="mobile-masthead-issue">EDISI · {issueDate} WIB</span>
        </div>
        <button
          ref={hamburgerRef}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text)]"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <FocusTrap active={mobileOpen}>
        <nav
          id="mobile-nav-drawer"
          className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-[var(--dur-short)] ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Navigasi section"
        >
          {drawerContent}
        </nav>
      </FocusTrap>
    </>
  )
}

export const SectionNav = memo(SectionNavBase)
