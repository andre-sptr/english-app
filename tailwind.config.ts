import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#F4F7FB",
        canvas: "#EAF0F7",
        surface: "#FFFFFF",
        "surface-2": "#F7FAFE",
        elevated: "#FFFFFF",
        ink: "#071426",
        secondary: "#405168",
        muted: "#6B7A90",
        subtle: "#DDE6F1",
        line: "#E7EDF5",
        brand: {
          50: "#EEF6FF",
          100: "#D7E9FF",
          200: "#ADD4FF",
          400: "#4A91FF",
          500: "#256EF4",
          600: "#1B55D9",
          700: "#183FAE",
          900: "#10265F",
        },
        teal: {
          50: "#EAFBF8",
          100: "#CFF5EE",
          500: "#18A999",
          600: "#0E8278",
        },
        gold: {
          50: "#FFF8E8",
          100: "#FFEBC2",
          500: "#C8962E",
          600: "#9A6B16",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        premium: "0 24px 70px rgba(7, 20, 38, 0.10)",
        card: "0 16px 45px rgba(7, 20, 38, 0.08)",
        soft: "0 8px 24px rgba(7, 20, 38, 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
