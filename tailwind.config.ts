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
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'md': '14px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      spacing: {
        'space-0': '0px',
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
      },
      colors: {
        // Design System Background Hierarchy
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-surface-elevated': 'var(--bg-surface-elevated)',
        'bg-surface-hover': 'var(--bg-surface-hover)',
        'bg-surface-active': 'var(--bg-surface-active)',
        'bg-input': 'var(--bg-input)',

        // Design System Border Colors
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-accent': 'var(--border-accent)',

        // Design System Text Colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-muted': 'var(--text-muted)',
        'text-link': 'var(--text-link)',

        // Design System Accent Colors
        'accent-primary': 'var(--accent-primary)',
        'accent-primary-hover': 'var(--accent-primary-hover)',
        'accent-primary-muted': 'var(--accent-primary-muted)',

        // Design System Semantic Colors
        'color-success': 'var(--color-success)',
        'color-warning': 'var(--color-warning)',
        'color-error': 'var(--color-error)',

        // Shadcn UI Compatibility
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
          muted: "var(--sidebar-muted)",
        },
        // Status Colors
        status: {
          draft: "var(--status-draft)",
          "draft-bg": "var(--status-draft-bg)",
          forecast: "var(--status-forecast)",
          "forecast-bg": "var(--status-forecast-bg)",
          soft: "var(--status-soft)",
          "soft-bg": "var(--status-soft-bg)",
          confirmed: "var(--status-confirmed)",
          "confirmed-bg": "var(--status-confirmed-bg)",
          matched: "var(--status-matched)",
          "matched-bg": "var(--status-matched-bg)",
          closed: "var(--status-closed)",
          "closed-bg": "var(--status-closed-bg)",
          delivered: "var(--status-delivered)",
          "delivered-bg": "var(--status-delivered-bg)",
        },
        // Grading Colors
        grading: {
          observer: "var(--grading-observer)",
          "observer-bg": "var(--grading-observer-bg)",
          declared: "var(--grading-declared)",
          "declared-bg": "var(--grading-declared-bg)",
          standard: "var(--grading-standard)",
          "standard-bg": "var(--grading-standard-bg)",
        },
        // MPK Status Colors
        mpk: {
          active: "var(--mpk-active)",
          "active-bg": "var(--mpk-active-bg)",
          restricted: "var(--mpk-restricted)",
          "restricted-bg": "var(--mpk-restricted-bg)",
          inactive: "var(--mpk-inactive)",
          "inactive-bg": "var(--mpk-inactive-bg)",
        },
        // Signal Colors
        signal: {
          risk: "var(--signal-risk)",
          "risk-bg": "var(--signal-risk-bg)",
          warning: "var(--signal-warning)",
          "warning-bg": "var(--signal-warning-bg)",
          positive: "var(--signal-positive)",
          "positive-bg": "var(--signal-positive-bg)",
        },
        // Pool Status Colors
        pool: {
          draft: "var(--pool-draft)",
          "draft-bg": "var(--pool-draft-bg)",
          submitted: "var(--pool-submitted)",
          "submitted-bg": "var(--pool-submitted-bg)",
          matching: "var(--pool-matching)",
          "matching-bg": "var(--pool-matching-bg)",
          partial: "var(--pool-partial)",
          "partial-bg": "var(--pool-partial-bg)",
          fulfilled: "var(--pool-fulfilled)",
          "fulfilled-bg": "var(--pool-fulfilled-bg)",
          closed: "var(--pool-closed)",
          "closed-bg": "var(--pool-closed-bg)",
          cancelled: "var(--pool-cancelled)",
          "cancelled-bg": "var(--pool-cancelled-bg)",
        },
        // Execution Status Colors
        exec: {
          matched: "var(--exec-matched)",
          "matched-bg": "var(--exec-matched-bg)",
          scheduled: "var(--exec-scheduled)",
          "scheduled-bg": "var(--exec-scheduled-bg)",
          delivered: "var(--exec-delivered)",
          "delivered-bg": "var(--exec-delivered-bg)",
          confirmed: "var(--exec-confirmed)",
          "confirmed-bg": "var(--exec-confirmed-bg)",
          settled: "var(--exec-settled)",
          "settled-bg": "var(--exec-settled-bg)",
          closed: "var(--exec-closed)",
          "closed-bg": "var(--exec-closed-bg)",
        },
        // Landing Page Colors (preserved for public pages)
        landing: {
          background: "var(--landing-background)",
          foreground: "var(--landing-foreground)",
          muted: "var(--landing-muted)",
          subtle: "var(--landing-subtle)",
          accent: "var(--landing-accent)",
          border: "var(--landing-border)",
          card: "var(--landing-card)",
          "card-hover": "var(--landing-card-hover)",
        },
        "landing-v2": {
          "bg-inverse": "var(--landing-v2-bg-inverse)",
          "text-inverse": "var(--landing-v2-text-inverse)",
          brand: "var(--landing-v2-brand)",
          "brand-hover": "var(--landing-v2-brand-hover)",
          "brand-active": "var(--landing-v2-brand-active)",
          "bg-light": "var(--landing-v2-bg-light)",
          "bg-muted": "var(--landing-v2-bg-muted)",
          "text-primary": "var(--landing-v2-text-primary)",
          "text-secondary": "var(--landing-v2-text-secondary)",
          "text-muted": "var(--landing-v2-text-muted)",
          "border-default": "var(--landing-v2-border-default)",
          "border-subtle": "var(--landing-v2-border-subtle)",
        },
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'focus': '0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-primary)',
        'focus-muted': '0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-primary-muted)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '300ms',
      },
      height: {
        'input': '36px',
        'button': '32px',
        'button-lg': '36px',
        'row': '40px',
        'row-lg': '44px',
        'header': '36px',
      },
      width: {
        'sidebar': '260px',
        'sidebar-lg': '280px',
        'panel': '280px',
        'panel-lg': '320px',
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
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
