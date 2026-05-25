import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body:    ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        jp:      ['"Noto Serif JP"', 'serif'],
      },
      colors: {
        ink:        '#0e0c0b',
        'ink-mid':  '#2a2622',
        'ink-soft': '#4a4540',
        parchment:        '#faf8f4',
        'parchment-dark': '#f0ece3',
        'parchment-mid':  '#e8e2d6',
        wood:       '#7a5c3a',
        'wood-light':'#a87c50',
        crimson:        '#8b1a1a',
        'crimson-bright':'#c0392b',
        'crimson-pale': 'rgba(139,26,26,0.07)',
        gold:        '#c8a96e',
        'gold-bright':'#d4af5a',
        'gold-pale': 'rgba(200,169,110,0.12)',
      },
      spacing: {
        nav: '60px',
      },
      borderColor: {
        'gold/08': 'rgba(200,169,110,0.08)',
        'gold/10': 'rgba(200,169,110,0.10)',
      },
      backgroundOpacity: {
        '95': '0.95',
      },
    },
  },
  plugins: [],
}

export default config
