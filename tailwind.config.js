// Corporate palette: white, black, grays + navy accent + dark green (positive) + red (errors)
const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
};

// Accent: navy blue (#1E40AF)
const navy = {
  50: '#F2F6FC',
  100: '#E4EAF8',
  200: '#CBD6F1',
  300: '#A6B6E4',
  400: '#7690D6',
  500: '#1E40AF',
  600: '#1A3A9E',
  700: '#16318A',
  800: '#122770',
  900: '#0E1F58',
  950: '#070F2C',
};

// Positive / success: dark green (non-neon)
const green = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: navy,
        emerald: green,
        // All decorative colors aliased to neutral gray (white/black theme)
        // blue = info/accent semantics -> navy
        blue: navy,
        amber: neutral,
        purple: neutral,
        violet: neutral,
        indigo: neutral,
        cyan: neutral,
        orange: neutral,
        teal: neutral,
        rose: neutral,
        yellow: neutral,
        lime: neutral,
        sky: neutral,
        pink: neutral,
        fuchsia: neutral,
        red: {
          50: '#FFF0EF',
          100: '#FFE0DD',
          200: '#FFC2BC',
          300: '#FF9E95',
          400: '#FF6B5E',
          500: '#FF3B30',
          600: '#E02E24',
          700: '#B8221A',
          800: '#931B14',
          900: '#781610',
          950: '#420B08',
        },
        dark: {
          50: 'var(--dark-50)',
          100: 'var(--dark-100)',
          200: 'var(--dark-200)',
          300: 'var(--dark-300)',
          400: 'var(--dark-400)',
          500: 'var(--dark-500)',
          600: 'var(--dark-600)',
          700: 'var(--dark-700)',
          800: 'var(--dark-800)',
          850: 'var(--dark-850)',
          900: 'var(--dark-900)',
          950: 'var(--dark-950)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        success: '#15803D',
        warning: '#737373',
        danger: '#FF3B30',
        info: '#1E40AF',
      },
      borderRadius: {
        'xl': '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(17,17,17,0.04), 0 1px 3px rgba(17,17,17,0.06)',
        'card-md': '0 8px 24px rgba(17,17,17,0.06), 0 2px 6px rgba(17,17,17,0.04)',
        'card-lg': '0 24px 60px rgba(17,17,17,0.10), 0 8px 20px rgba(17,17,17,0.05)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(17,17,17,0.07)',
        'neon': '0 1px 2px rgba(17,17,17,0.06)',
        'neon-lg': '0 4px 12px rgba(17,17,17,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
};
