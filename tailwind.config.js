/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        },
        // AzFIT Design System
        cyan: {
          DEFAULT: '#00AEEF',
          light: '#33BFF2',
          dark: '#008DC4',
          glow: 'rgba(0, 174, 239, 0.15)',
        },
        silver: {
          DEFAULT: '#C0C0C0',
          light: '#E0E0E0',
          dark: '#9A9A9A',
        },
        // Semantic colors
        success: {
          DEFAULT: '#22C55E',
          light: 'rgba(34, 197, 94, 0.12)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.12)',
        },
        warning: {
          DEFAULT: '#EAB308',
          light: 'rgba(234, 179, 8, 0.12)',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: 'rgba(59, 130, 246, 0.12)',
        },
        // Role accents
        'trainer-accent': '#EC4899',
        'client-accent': '#00AEEF',
        'admin-accent': '#A855F7',
        // Dark mode
        'az-black': '#0A0A0A',
        'az-black-card': '#141414',
        'az-black-elevated': '#1A1A1A',
        // Semantic dark theme tokens
        dark: {
          muted: '#6B6B6B',
          primary: '#F0F0F0',
          secondary: '#A0A0A0',
          border: '#2A2A2A',
          hover: '#242424',
          subtle: '#3A3A3A',
          divider: '#1F1F1F',
        },
        // Semantic light theme tokens
        light: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          border: '#E2E8F0',
          surface: '#F8FAFC',
          hover: '#F1F5F9',
        },
        // Extended accent tokens
        violet: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        orange: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
        // Extended cyan
        cyan: {
          DEFAULT: '#00AEEF',
          light: '#33BFF2',
          dark: '#008DC4',
          hover: '#009BD6',
          glow: 'rgba(0, 174, 239, 0.15)',
        },
        // Navy (BioPrint / dashboard cards)
        navy: {
          DEFAULT: '#151D2E',
          border: '#2A3A50',
          input: '#0B1120',
        },
        // Extended grays for inline styles
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // One-off tokens for remaining hex values
        'gray-550': '#6B7280',
        'gray-650': '#4B5563',
        'gray-750': '#374151',
        'gray-850': '#1F2937',
        'gray-950': '#111827',
        'teal': '#06B6D4',
        'indigo': '#6366F1',
        'amber': '#CA8A04',
        'violet-light': '#C084FC',
        'violet-dark': '#6D28D9',
        'emerald': '#16A34A',
        'emerald-light': '#10B981',
        'pink': '#DB2777',
        'rose': '#EA580C',
        'amber-light': '#D97706',
        'blue-ocean': '#0077B6',
        'off-white': '#F5F7FA',
        'off-white-2': '#F8F9FA',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'cyan': '0 4px 14px rgba(0, 174, 239, 0.3)',
        'cyan-lg': '0 6px 20px rgba(0, 174, 239, 0.4)',
        'trainer': '0 8px 24px rgba(236, 72, 153, 0.4)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'modal': '0 24px 48px rgba(0, 0, 0, 0.2)',
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slideUp": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slideIn": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulseGlow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 174, 239, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 174, 239, 0.6)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },
        "orb-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.95" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
        "slideUp": "slideUp 0.5s ease-out forwards",
        "slideIn": "slideIn 0.5s ease-out forwards",
        "pulseGlow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "bounce": "bounce 1.5s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "ken-burns": "ken-burns 20s linear forwards",
        "orb-breathe": "orb-breathe 4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 3s ease-out infinite",
        "spin-slow": "spin-slow 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
