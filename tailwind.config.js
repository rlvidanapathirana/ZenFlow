/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        zen: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#030712',
        },
      },
      animation: {
        'spin-slow':       'spin 8s linear infinite',
        'pulse-ring':      'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':           'float 6s ease-in-out infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'slide-up':        'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':      'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':         'fade-in 0.3s ease-out',
        'scale-in':        'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse':      'glow-pulse 3s ease-in-out infinite',
        'wave':            'wave 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%':      { transform: 'scale(1.08)', opacity: '0.4' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.92)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-cyan':   '0 0 20px rgba(6, 182, 212, 0.4)',
        'glass':       '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-light': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.4)',
        'card-light':  '0 4px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
