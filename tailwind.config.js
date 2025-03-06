/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-blue': '#007AFF',
        'app-purple': '#5E5CE6',
        'app-orange': '#FF9500',
        'app-pink': '#FF2D55',
        'app-gray': {
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#C7C7CC',
          500: '#AEAEB2',
          600: '#8E8E93',
          700: '#636366',
          800: '#48484A',
          900: '#3A3A3C',
        },
      },
      boxShadow: {
        'apple': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'levitate': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'levitate-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 1.5s infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wave': {
          '0%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.5)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
