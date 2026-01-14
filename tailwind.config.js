/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'flavis-blue': '#326371',
        'flavis-gold': 'rgb(222, 181, 99)',
        'flavis-dark': '#162a30',
        'flavis-card-dark': '#1e3b44',
      },
      fontFamily: {
        'main': ['"Bavista Soulare"', 'serif'],
        'secondary': ['"Prate Regular"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}