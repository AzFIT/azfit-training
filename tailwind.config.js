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
          "0%": { transform: "scale(1.02) translate(0, 0)" },
          "100%": { transform: "scale(1.05) translate(-1%, -0.5%)" },
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
