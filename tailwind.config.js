/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        felt: {
          light: "#2e7d4f",
          dark: "#0f3d24",
        },
        gold: "#d4af37",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};