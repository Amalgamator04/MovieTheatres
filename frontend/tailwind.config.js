/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#302b43",
        lavender: "#8c70d6",
        lilac: "#eee8ff",
        cream: "#fffaf2",
        mint: "#dcf4e8",
        blush: "#ffe5ee",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        clay: "10px 12px 28px rgba(111, 92, 161, .12), -7px -7px 20px rgba(255,255,255,.92), inset 1px 1px 0 rgba(255,255,255,.8)",
        raised: "0 12px 28px rgba(86, 66, 131, .19), inset 0 1px 0 rgba(255,255,255,.55)",
      },
    },
  },
  plugins: [],
};
