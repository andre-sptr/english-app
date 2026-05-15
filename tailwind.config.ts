import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#FAFAF8",
        surface: "#FFFFFF",
        "surface-2": "#F4F4F1",
        ink: "#0B1929",
        secondary: "#4A5568",
        muted: "#6B7280",
        subtle: "#E8E8E4",
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%":   { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
