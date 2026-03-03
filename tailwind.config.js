/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        peach: {
          50: '#FFF0E0',
          100: '#FFE4CC',
          200: '#FDDCB5',
          300: '#FBCB92',
        },
        brown: {
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#A16207',
          800: '#92400E',
          900: '#78350F',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'Segoe UI', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        warm: '0 2px 16px 0 rgba(180, 83, 9, 0.08), 0 1px 4px 0 rgba(180, 83, 9, 0.05)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
