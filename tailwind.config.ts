import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        fill: {
          1: "rgba(125, 249, 255, 0.10)",
        },
        bankGradient: "#38BDF8",
        milo: {
          void: "#050B1F",
          midnight: "#081226",
          navy: "#0B1733",
          panel: "#0F1F3D",
          card: "#12284A",
          line: "#203C63",
          cyan: "#38BDF8",
          blue: "#2563EB",
          violet: "#8B5CF6",
          mint: "#34D399",
          gold: "#FBBF24",
          text: "#EAF2FF",
          muted: "#94A3B8",
        },
        indigo: {
          500: "#8B5CF6",
          700: "#6D28D9",
        },
        success: {
          25: "#062A25",
          50: "#073B32",
          100: "#0A5C4F",
          600: "#34D399",
          700: "#10B981",
          900: "#D1FAE5",
        },
        pink: {
          25: "#2D1130",
          100: "#4A1D4F",
          500: "#E879F9",
          600: "#D946EF",
          700: "#F0ABFC",
          900: "#FAE8FF",
        },
        blue: {
          25: "#071A33",
          100: "#0B2A52",
          500: "#38BDF8",
          600: "#2563EB",
          700: "#60A5FA",
          900: "#E0F2FE",
        },
        sky: {
          1: "#06152C",
        },
        black: {
          1: "#EAF2FF",
          2: "#CBD5E1",
        },
        gray: {
          25: "#081226",
          100: "#0D1B33",
          200: "#203C63",
          300: "#35527A",
          500: "#94A3B8",
          600: "#CBD5E1",
          700: "#DCE8F8",
          900: "#F8FBFF",
        },
      },
      backgroundImage: {
        "bank-gradient":
          "linear-gradient(135deg, #2563EB 0%, #38BDF8 52%, #8B5CF6 100%)",
        "milo-radial":
          "radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.18), transparent 34%), radial-gradient(circle at 85% 10%, rgba(139, 92, 246, 0.18), transparent 30%), linear-gradient(135deg, #050B1F 0%, #081226 48%, #0B1733 100%)",
        "milo-panel":
          "linear-gradient(180deg, rgba(18, 40, 74, 0.94) 0%, rgba(8, 18, 38, 0.96) 100%)",
        "milo-card":
          "linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(56, 189, 248, 0.9) 48%, rgba(139, 92, 246, 0.9) 100%)",
        "gradient-mesh": "url('/icons/gradient-mesh.svg')",
        "bank-green-gradient":
          "linear-gradient(135deg, #047857 0%, #34D399 52%, #38BDF8 100%)",
      },
      boxShadow: {
        form: "0px 12px 30px -18px rgba(56, 189, 248, 0.65)",
        chart:
          "0px 18px 50px -28px rgba(56, 189, 248, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        profile:
          "0px 20px 40px -22px rgba(56, 189, 248, 0.7), 0px 0px 0px 1px rgba(125, 249, 255, 0.14)",
        creditCard: "0px 24px 60px -30px rgba(56, 189, 248, 0.75)",
      },
      fontFamily: {
        inter: "var(--font-inter)",
        "ibm-plex-serif": "var(--font-ibm-plex-serif)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
