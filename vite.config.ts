import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          /* ── Framework core ── */
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/router')) {
            return 'vendor-router'
          }

          /* ── Animation ── */
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer-motion'
          }

          /* ── Charts (keep isolated — large library) ── */
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }

          /* ── Icons ── */
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide'
          }

          /* ── UI primitives (Radix + styling utils) ── */
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          if (id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'vendor-radix'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
