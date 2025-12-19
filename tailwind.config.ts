import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          muted: "hsl(var(--sidebar-muted))",
        },
        status: {
          forecast: "hsl(var(--status-forecast))",
          "forecast-bg": "hsl(var(--status-forecast-bg))",
          soft: "hsl(var(--status-soft))",
          "soft-bg": "hsl(var(--status-soft-bg))",
          confirmed: "hsl(var(--status-confirmed))",
          "confirmed-bg": "hsl(var(--status-confirmed-bg))",
          delivered: "hsl(var(--status-delivered))",
          "delivered-bg": "hsl(var(--status-delivered-bg))",
        },
        grading: {
          observer: "hsl(var(--grading-observer))",
          "observer-bg": "hsl(var(--grading-observer-bg))",
          declared: "hsl(var(--grading-declared))",
          "declared-bg": "hsl(var(--grading-declared-bg))",
          standard: "hsl(var(--grading-standard))",
          "standard-bg": "hsl(var(--grading-standard-bg))",
        },
        mpk: {
          active: "hsl(var(--mpk-active))",
          "active-bg": "hsl(var(--mpk-active-bg))",
          restricted: "hsl(var(--mpk-restricted))",
          "restricted-bg": "hsl(var(--mpk-restricted-bg))",
          inactive: "hsl(var(--mpk-inactive))",
          "inactive-bg": "hsl(var(--mpk-inactive-bg))",
        },
        signal: {
          risk: "hsl(var(--signal-risk))",
          "risk-bg": "hsl(var(--signal-risk-bg))",
          warning: "hsl(var(--signal-warning))",
          "warning-bg": "hsl(var(--signal-warning-bg))",
          positive: "hsl(var(--signal-positive))",
          "positive-bg": "hsl(var(--signal-positive-bg))",
        },
        pool: {
          pending: "hsl(var(--pool-pending))",
          "pending-bg": "hsl(var(--pool-pending-bg))",
          partial: "hsl(var(--pool-partial))",
          "partial-bg": "hsl(var(--pool-partial-bg))",
          fulfilled: "hsl(var(--pool-fulfilled))",
          "fulfilled-bg": "hsl(var(--pool-fulfilled-bg))",
          cancelled: "hsl(var(--pool-cancelled))",
          "cancelled-bg": "hsl(var(--pool-cancelled-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
