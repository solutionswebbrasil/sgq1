/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3f4c6b',
          dark: '#1a1a1a'
        },
        secondary: {
          light: '#f3f4f6',
          dark: '#2d2d2d'
        },
        content: {
          light: '#1f2937',
          dark: '#ffffff'
        }
      }
    },
  },
  plugins: [],
};