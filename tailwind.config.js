/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Heebo', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50: '#f3f1ff',
          100: '#e8e4ff',
          200: '#d3ccff',
          400: '#9483ff',
          500: '#7357f6',
          600: '#5f3fe6',
          700: '#4f31c4',
        },
        coral: { 400: '#ff8a7a', 500: '#ff6b5b' },
        mint: { 200: '#b8f0d8', 700: '#1f7a5a' },
      },
    },
  },
  plugins: [],
};
