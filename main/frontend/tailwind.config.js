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
        // 公司官网UX设计系统 - 主色（蓝色系，现代科技感）
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // 主色 - 蓝色
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // 公司官网UX设计系统 - 中性色
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // 公司官网UX设计系统 - 语义色（使用semantic-前缀）
        'semantic-success': '#10B981',
        'semantic-warning': '#F59E0B',
        'semantic-error': '#EF4444',
        'semantic-info': '#3B82F6',
        // 原有颜色系统（保留兼容性）
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
      spacing: {
        // 公司官网UX设计系统 - 间距系统（8px基准）
        'ux-1': '4px',   // xs
        'ux-2': '8px',   // sm
        'ux-3': '12px',  // md
        'ux-4': '16px',  // lg
        'ux-5': '20px',  // xl
        'ux-6': '24px',  // 2xl
        'ux-8': '32px',  // 3xl
        'ux-12': '48px', // 4xl
        'ux-16': '64px', // 5xl
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'sans-serif'],
        'title': ['PingFang SC Medium', 'Noto Sans SC Medium', 'sans-serif'],
      },
      fontSize: {
        // 公司官网UX设计系统 - 标题字体
        'ux-h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'ux-h2': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'ux-h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'ux-h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'ux-h5': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'ux-h6': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        // 公司官网UX设计系统 - 正文字体
        'ux-body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'ux-body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'ux-body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'ux-body-xs': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        // 原有字体系统（保留兼容性）
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

