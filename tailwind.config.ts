import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080A",
          900: "#0D0D10",
          850: "#121216",
          800: "#17171C",
          700: "#1F1F26",
          600: "#2A2A33",
        },
        acid: "#E2FF3D",
        flame: "#FF7A1A",
        viola: "#A855F7",
        azure: "#38BDF8",
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(226, 255, 61, 0.45)",
        card: "0 12px 40px -18px rgba(0, 0, 0, 0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
