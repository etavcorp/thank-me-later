/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { 
        brand: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' } 
      },
      fontFamily: { 
        sans: ['Inter', 'sans-serif'], 
        serif: ['Playfair Display', 'serif'] 
      }
    },
  },
  plugins: [],
}