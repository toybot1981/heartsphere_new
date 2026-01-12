/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 小学生版：明亮、活泼的色彩
        primary: {
          elementary: {
            50: '#fef3e2',
            100: '#fde4b8',
            200: '#fccd8a',
            300: '#fab05c',
            400: '#f9983a',
            500: '#f88120', // 主色：橙色
            600: '#e96c18',
            700: '#d65514',
            800: '#c34212',
            900: '#a82910',
          },
          // 中学生版：更成熟的配色
          middle: {
            50: '#e8f4f8',
            100: '#c9e6f0',
            200: '#a5d4e8',
            300: '#7cc2e0',
            400: '#5ab4da',
            500: '#3aa6d4', // 主色：蓝色
            600: '#3296c0',
            700: '#2881a8',
            800: '#1f6d90',
            900: '#0f4d6b',
          },
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontSize: {
        // 儿童友好的字体大小
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        // 8px 基准间距系统
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}