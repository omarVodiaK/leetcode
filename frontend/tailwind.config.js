/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        leetcode: {
          bg: '#1a1a2e',
          surface: '#16213e',
          panel: '#0f3460',
          accent: '#e94560',
          green: '#00b8a3',
          yellow: '#ffa116',
          red: '#ef4743',
        },
      },
    },
  },
  plugins: [],
}
