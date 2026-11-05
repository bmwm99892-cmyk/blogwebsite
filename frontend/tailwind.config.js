/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        logo: ['Cinzel', 'Newsreader', 'serif'],
      },
      colors: {
        editorial: {
          900: '#121212',
          800: '#1C1C1C',
          700: '#2E2E2E',
          600: '#4A4A4A',
          500: '#6B6B6B',
          400: '#8E8E8E',
          300: '#B8B8B6',
          200: '#E2E2DF',
          100: '#F0F0ED',
          50: '#FAFAF8',
        },
      },
      letterSpacing: {
        editorial: '0.22em',
      },
    },
  },
  plugins: [],
}
