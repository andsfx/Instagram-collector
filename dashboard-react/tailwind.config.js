/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
        'brand-hover': 'var(--brand-hover)',
        'brand-strong': 'var(--brand-strong)',
        'brand-soft': 'var(--brand-soft)',
        'brand-soft-2': 'var(--brand-soft-2)',
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
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        'panel-sm': 'var(--radius-sm)',
        'panel-md': 'var(--radius-md)',
        'panel-lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'panel-sm': 'var(--shadow-sm)',
        'panel-md': 'var(--shadow-md)',
      },
      maxWidth: {
        shell: '1360px',
        copy: '60ch',
      },
      screens: {
        mobile: '720px',
        desktop: '1024px',
      },
      spacing: {
        4.5: '18px',
        5.5: '22px',
        7.5: '30px',
        18: '72px',
      },
      zIndex: {
        nav: '50',
        skip: '120',
      },
    },
  },
  plugins: [],
}
