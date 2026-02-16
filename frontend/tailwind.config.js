/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
          light: '#38BDF8'
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399'
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FBBF24'
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#F87171'
        },
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155'
        },
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
