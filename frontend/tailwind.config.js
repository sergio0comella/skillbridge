/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dce8ff',
          200: '#b9d3ff',
          300: '#85b3ff',
          400: '#4d8eff',
          500: '#1a6aff',
          600: '#0050f5',
          700: '#003de2',
          800: '#0033b7',
          900: '#002d90',
          950: '#001b5e',
        },
        sage: {
          50:  '#f1f8f2',
          100: '#def0e2',
          200: '#bee1c6',
          300: '#8fcaa0',
          400: '#5aad72',
          500: '#368e52',
          600: '#277240',
          700: '#205b35',
          800: '#1c482c',
          900: '#183b25',
          950: '#0c2116',
        },
        surface: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(0,0,0,0.06)',
        'soft': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'soft-md': '0 8px 24px 0 rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.06)',
        'soft-lg': '0 16px 40px 0 rgba(0,0,0,0.12)',
        'brand': '0 8px 24px 0 rgba(26,106,255,0.25)',
        'brand-lg': '0 16px 40px 0 rgba(26,106,255,0.30)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
