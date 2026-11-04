import { memo } from 'react'
import {
  CalendarClock,
  ChartLine,
  Flag,
  Layers,
  LayoutDashboard,
  Scale,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'

/**
 * Section navigation.
 *
 * Semantics note (accepted, intentional change): this replaces the previous
 * `role="tablist"` + roving-tabindex nav with ordinary page navigation —
 * buttons carrying `aria-current="page"` on the active item. Arrow/Home/End
 * roving was a tabs-only affordance and is not reimplemented; Tab + Enter is
 * the correct interaction for switching pages. Focus return on close and
 * Escape dismissal come from Radix `Sheet` inside `Sidebar`'s mobile branch,
 * which also provides the focus trap the old `FocusTrap` implemented by hand.
 */

export interface SectionNavItem {
  id: string
  label: string
  description?: string
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  'section-summary': LayoutDashboard,
  'section-growth': TrendingUp,
  'section-content': Layers,
  'section-comparison': Scale,
  'section-charts': ChartLine,
  'section-pattern': CalendarClock,
  'section-recap': Flag,
}

function useIssueStamp() {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date())
}

function SectionNavBase({
  items,
  theme,
  onToggleTheme,
  activeSection,
  onSectionChange,
  meta,
}: {
  items: SectionNavItem[]
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  activeSection: string
  onSectionChange: (id: string) => void
  meta?: { dateLabel: string; accountCount: number; brand: string | null }
}) {
  const issue = useIssueStamp()
  const themeLabel = theme === 'dark' ? 'Terang' : 'Gelap'
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" aria-label="Navigasi utama">
      <SidebarHeader>
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="font-heading text-sm font-semibold tracking-tight">IG Collector</span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            {meta?.dateLabel ?? issue}
            <br />
            {meta ? `${meta.accountCount} akun` : 'brief harian'}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Bagian</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = SECTION_ICONS[item.id] ?? LayoutDashboard
                const isActive = activeSection === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      type="button"
                      isActive={isActive}
                      tooltip={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        onSectionChange(item.id)
                        if (isMobile) setOpenMobile(false)
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {meta?.brand ? (
            <SidebarMenuItem>
              <div className="flex items-baseline justify-between gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <span>Acuan</span>
                <span className="font-medium text-foreground">@{meta.brand}</span>
              </div>
            </SidebarMenuItem>
          ) : null}
          <SidebarSeparator className="my-1" />
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              onClick={onToggleTheme}
              aria-label={`Ganti ke mode ${themeLabel.toLowerCase()}`}
            >
              <span className="size-3 rounded-full border border-border bg-foreground" aria-hidden="true" />
              <span>Mode {theme === 'dark' ? 'gelap' : 'terang'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export const SectionNav = memo(SectionNavBase)
