/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          pink: {
            DEFAULT: '#FF9999',
            light: '#FFB3B3',
            lighter: '#FFCCCC',
            lightest: '#FFE5E5',
          },
          beige: {
            DEFAULT: '#F5F0E8',
            light: '#E8DDD4',
            dark: '#D4C4B8',
          },
          orange: {
            DEFAULT: '#FFB366',
            light: '#FFD699',
          },
        },
        calm: {
          blue: {
            DEFAULT: '#7FB8D1',
            light: '#9FC9E0',
            lighter: '#BFD9E8',
            lightest: '#E8F4F8',
          },
        },
        success: {
          DEFAULT: '#A8D5BA',
        },
        warning: {
          DEFAULT: '#FFD699',
        },
        error: {
          DEFAULT: '#FF9999',
        },
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'sans-serif'],
        'title': ['PingFang SC Medium', 'Noto Sans SC Medium', 'sans-serif'],
      },
      fontSize: {
        'hero': ['2rem', { lineHeight: '1.2' }],
        'h1': ['2rem', { lineHeight: '1.2' }],
        'h2': ['1.5rem', { lineHeight: '1.3' }],
        'h3': ['1.25rem', { lineHeight: '1.3' }],
        'h4': ['1.125rem', { lineHeight: '1.3' }],
        'body-lg': ['1rem', { lineHeight: '1.8' }],
        'body': ['0.875rem', { lineHeight: '1.6' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5' }],
        'xs': ['0.6875rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'primary': '0 4px 16px rgba(255, 153, 153, 0.3)',
        'glow': '0 0 20px rgba(255, 153, 153, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'slide-out': 'slideOut 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}

