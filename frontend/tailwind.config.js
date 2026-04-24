/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tn: {
          bg:      '#06111f',
          surface: '#0d1f35',
          card:    '#112240',
          border:  '#1e3a5f',
          gold:    '#d4a843',
          'gold-dim': '#8a6820',
          red:     '#cc2936',
          teal:    '#0d8f9a',
          'teal-light': '#12b5c3',
          ivory:   '#f0e6d3',
          muted:   '#7a9cc0',
          green:   '#2aaa7e',
          yellow:  '#e8b84b',
          danger:  '#cc3333',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'zellige': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a843' fill-opacity='0.06'%3E%3Cpath d='M30 0L60 30L30 60L0 30z'/%3E%3Cpath d='M30 15L45 30L30 45L15 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
