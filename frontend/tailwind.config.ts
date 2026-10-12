import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        romance: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        night: {
          950: '#0b0c11', // Deepest background - restful for long reading
          900: '#11131b', // Surface background
          850: '#171924', // Card & modal background
          800: '#1f2231', // Elevated border
          700: '#2b2f44', // Active border
          600: '#434964',
          400: '#8e96b3', // Soft muted text
          300: '#b4bbd4',
          200: '#d7dbec',
          100: '#f0f2fa',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'soft-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    }
  }
}
