/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sea: {
          dark: '#071A1D',
          surface: '#0D282C',
          card: '#0A2226',
          border: '#13393E',
          hover: '#18474E',
        },
        laterite: '#A84F32',
        monsoon: '#176B6C',
        mandovi: '#D8C39A',
        terracotta: '#C96846',
        sunset: '#F06F61',
        coconut: '#F4EBD0',
        hh: {
          green: '#0B6839',
          yellow: '#FEE101',
          pink: '#FF0080',
        }
      },
      fontFamily: {
        heading: ['Imbue', 'serif'],
        mono: ['"Victor Mono"', 'monospace'],
        sans: ['"Victor Mono"', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'evidence-pulse': 'evidencePulse 2s infinite',
      },
      keyframes: {
        evidencePulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
