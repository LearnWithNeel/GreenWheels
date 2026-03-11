/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        gw: {
          950: "#021a08",
          900: "#052e16",
          800: "#14532d",
          700: "#15803d",
          600: "#16a34a",
          500: "#22c55e",
          400: "#4ade80",
          300: "#86efac",
          200: "#bbf7d0",
        },
      },
      boxShadow: {
        "glow-green": "0 0 30px rgba(34,197,94,0.25)",
        "glow-lime":  "0 0 35px rgba(163,230,53,0.3)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "spin-slow": "spin 14s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};