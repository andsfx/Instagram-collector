import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-muted': 'var(--panel-muted)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-soft': 'var(--text-soft)',
        brand: 'var(--brand)',
        'brand-soft': 'var(--brand-soft)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        'chart-grid': 'var(--chart-grid)',
        'chart-axis': 'var(--chart-axis)',
        'chart-tooltip-bg': 'var(--chart-tooltip-bg)',
        'chart-tooltip-border': 'var(--chart-tooltip-border)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        'panel-sm': 'var(--shadow-sm)',
        'panel-md': 'var(--shadow-md)',
      },
      maxWidth: {
        dashboard: '1200px',
        'hero-copy': '780px',
      },
      minWidth: {
        'chart-wide': '540px',
        'chart-xl': '720px',
        'daily-card': '280px',
        'insight-side': '320px',
      },
      spacing: {
        4.5: '18px',
        5.5: '22px',
        18: '72px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1' }],
        '2xs': ['0.78rem', { lineHeight: '1.1' }],
        sm: ['0.9rem', { lineHeight: '1.4' }],
        base: ['1rem', { lineHeight: '1.5' }],
        section: ['1.4rem', { lineHeight: '1.2' }],
      },
      zIndex: {
        nav: '50',
        skip: '120',
      },
      screens: {
        mobile: '720px',
        desktop: '1024px',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      backgroundImage: {
        'score-a': 'linear-gradient(90deg, #2152d9, #5b7cf6)',
        'score-b': 'linear-gradient(90deg, #e1306c, #f06e94)',
        'featured-card': 'linear-gradient(180deg, rgba(33, 82, 217, 0.05), rgba(225, 48, 108, 0.05))',
      },
    },
  },
  plugins: [],
}

export default config
