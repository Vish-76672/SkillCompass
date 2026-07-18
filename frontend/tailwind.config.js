/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF0E8',
        card: '#F9FAF5',
        ink: '#22302B',
        'ink-soft': '#4B5C54',
        trail: '#4F6B4C',
        'trail-dark': '#3A4F38',
        summit: '#B98B2E',
        'summit-soft': '#E5C583',
        contour: '#AEB6A5',
        alert: '#A24F3E',
      },
      fontFamily: {
        display: ['"Spectral"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(34, 48, 43, 0.06), 0 8px 24px -12px rgba(34, 48, 43, 0.18)',
      },
    },
  },
  plugins: [],
}
