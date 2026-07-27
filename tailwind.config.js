/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#064E3B", light: "#047857", dark: "#022C21" },
        gold: { DEFAULT: "#D4AF37", light: "#FBEB9F", dark: "#B45309" },
        cream: "#FDFBF7",
      },
    },
  },
  plugins: [],
};
