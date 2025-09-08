import type { Config } from "tailwindcss";
import { colors } from "./src/styles/config/colors";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SmartPlates Brand Colors
        primary: colors.primary,
        secondary: colors.neutral,
        accent: colors.coral,
        
        // Semantic Colors
        success: colors.success,
        warning: {
          DEFAULT: colors.chart.yellow,
          foreground: colors.text.primary,
        },
        error: {
          DEFAULT: colors.chart.red,
          foreground: colors.text.inverse,
        },
        info: {
          DEFAULT: colors.chart.blue,
          foreground: colors.text.inverse,
        },
        
        // UI Component Colors
        background: {
          DEFAULT: colors.background.primary,
          secondary: colors.background.secondary,
        },
        foreground: colors.text.primary,
        card: {
          DEFAULT: colors.background.card,
          foreground: colors.text.primary,
        },
        popover: {
          DEFAULT: colors.background.card,
          foreground: colors.text.primary,
        },
        border: colors.border.light,
        input: colors.border.medium,
        ring: colors.primary[400],
        muted: {
          DEFAULT: colors.neutral[100],
          foreground: colors.text.muted,
        },
        
        // Shadcn/ui compatible color scheme
        destructive: {
          DEFAULT: colors.chart.red,
          foreground: colors.text.inverse,
        },
        
        // Chart colors for dashboard
        chart: colors.chart,
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
