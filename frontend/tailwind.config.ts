import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marine: {
          50: "#EAF1FA",
          100: "#C6D6EA",
          200: "#8FA9CE",
          300: "#557CAE",
          400: "#28548C",
          500: "#0B2E5C",
          600: "#082748",
          700: "#061D36",
          800: "#041326",
          900: "#020A16",
        },
        leaf: {
          50: "#E8F5EC",
          100: "#C4E6CE",
          200: "#8FCDA1",
          300: "#56B273",
          400: "#2E9C52",
          500: "#1F8A3B",
          600: "#187030",
          700: "#125425",
          800: "#0C3A19",
          900: "#06200D",
        },
        cream: {
          50: "#FBF9F4",
          100: "#F7F4EE",
          200: "#EFEAE0",
          300: "#E1DACB",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(11,46,92,0.06), 0 8px 24px rgba(11,46,92,0.06)",
        lift: "0 4px 8px rgba(11,46,92,0.08), 0 16px 40px rgba(11,46,92,0.12)",
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
