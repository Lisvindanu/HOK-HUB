import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hokapi.project-n.site',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
