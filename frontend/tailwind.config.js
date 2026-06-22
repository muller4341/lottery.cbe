/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#faf2fb',
          100: '#f3e3f7',
          200: '#e8c9ef',
          300: '#d9a0e2',
          400: '#c36bd0',
          500: '#aa47b5',
          600: '#95298e', // rgb(149, 41, 142)
          700: '#7d1e77',
          800: '#671c61',
          900: '#561b51',
          950: '#360b32',
        },
        gold: {
          50:  '#fbf8ee',
          100: '#f7ecc3',
          200: '#edd88d',
          300: '#deb953',
          400: '#cd9d37',
          500: '#b38d32', // rgb(179, 141, 50)
          600: '#9c7428',
          700: '#825a21',
          800: '#6c4a20',
          900: '#5c3d1f',
          950: '#35200e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
