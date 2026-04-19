/**
 * Shared chart styling constants for Recharts components.
 * Centralised here to avoid duplication across QuickVisual, FeaturedGrowthChart, and HeadToHead.
 */

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
