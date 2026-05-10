import { memo, useEffect, useRef, useState } from 'react'
import FocusTrap from 'focus-trap-react'
import { RefreshIndicator, type RefreshStatus } from './RefreshIndicator'

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
  refreshStatus,
  onRefresh,
  refreshDisabled = false,
  activeSection,
  onSectionChange,
}: {
  items: SectionNavItem[]
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  refreshStatus: RefreshStatus
  onRefresh?: () => void
  refreshDisabled?: boolean
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

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[image:var(--ig-gradient)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
          </div>
          <div className="grid">
            <span className="text-sm font-bold text-[var(--text)]">IG Dashboard</span>
            <span className="text-[10px] text-[var(--text-soft)]">Competitor Intel</span>
          </div>
        </div>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-soft)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text)] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-soft)]">Sections</div>
        <div className="grid gap-0.5">
          {items.map((item) => {
            const iconPath = SECTION_ICONS[item.id] || 'M4 6h16M4 12h16M4 18h16'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-label={`Navigasi ke ${item.label}`}
                title={item.label}
                className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-[var(--brand-soft)] text-[var(--brand)] font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--panel-muted)]'
                }`}
                aria-current={activeSection === item.id ? 'location' : undefined}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
                  <path d={iconPath} />
                </svg>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2 border-t border-[var(--border)] px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <RefreshIndicator status={refreshStatus} />
          <button type="button" className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)] transition hover:text-[var(--text)] hover:border-[var(--border-strong)]" onClick={onToggleTheme} aria-label="Toggle dark mode" aria-pressed={theme === 'dark'}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        {onRefresh && (
          <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-55" onClick={onRefresh} disabled={refreshDisabled} aria-disabled={refreshDisabled}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"/><path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"/></svg>
            Refresh
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3 shadow-[var(--shadow-sm)] lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[image:var(--ig-gradient)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
          </div>
          <span className="text-sm font-bold text-[var(--text)]">IG Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button type="button" className="flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--brand)] bg-[var(--brand-soft)] px-3 text-[11px] font-bold text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-55" onClick={onRefresh} disabled={refreshDisabled} aria-disabled={refreshDisabled} aria-label="Refresh data">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"/><path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"/></svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
          <button ref={hamburgerRef} type="button" className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text)]" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-nav-drawer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - desktop: fixed, mobile: slide-in drawer */}
      <FocusTrap active={mobileOpen}>
        <nav
          id="mobile-nav-drawer"
          className={`fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          aria-label="Section navigation"
        >
          {sidebarContent}
        </nav>
      </FocusTrap>
    </>
  )
}

export const SectionNav = memo(SectionNavBase)