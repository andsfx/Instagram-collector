/**
 * Shared chart styling constants for Recharts components.
 * Centralised here to avoid duplication across QuickVisual, FeaturedGrowthChart, and HeadToHead.
 *
 * Instagram brand palette is used consistently across all charts via CHART_COLORS.
 * CSS custom properties: --ig-pink, --ig-purple, --ig-blue, --ig-orange
 */

/**
 * Instagram brand color palette for charts.
 * Order: pink, purple, blue, orange, then additional colors for more accounts.
 */
export const CHART_COLORS = [
  'var(--ig-pink)',    // #E1306C
  'var(--ig-purple)',  // #833AB4
  'var(--ig-blue)',    // #405DE6
  'var(--ig-orange)',  // #F77737
  'var(--ig-violet)',  // #5B51D8
  'var(--ig-yellow)',  // #FCAF45
] as const

/**
 * Returns the chart color for an account at the given index.
 * Cycles through the palette if there are more accounts than colors.
 */
export function getAccountColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export const chartAxisColor = 'var(--chart-axis)'
export const chartGridColor = 'var(--chart-grid)'

export const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '12px',
  color: 'var(--text)',
}

export const chartLabelStyle: React.CSSProperties = { color: 'var(--text)' }
export const chartItemStyle: React.CSSProperties = { color: 'var(--text)' }
export const chartLegendStyle: React.CSSProperties = { color: 'var(--text-muted)' }
