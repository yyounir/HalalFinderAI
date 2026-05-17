/** @type {import('tailwindcss').Config} */
export default {
  // This tells Tailwind exactly where to look for your class names. 
  // If this is incorrect or missing, your deployed app will look completely unstyled!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}" 
  ],
  darkMode: 'class', // Matches your html.dark setup in index.css
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--sans)', 'sans-serif'],
        heading: ['var(--heading)', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#00601a',
          light: '#b5fec9',
          accent: '#00c034'
        }
      }
    },
  },
  plugins: [],
}