import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from '@base44/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), base44()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // In the Base44 preview sandbox the vite plugin's sandbox mode handles
  // server binding, host allowlists, and file-watch polling — but it does
  // NOT set up the /api proxy (the platform handles that at a different
  // layer).  In Docker we need both, so we add the proxy here, gated on
  // BASE44_PREVIEW_MODE so it never affects other environments.
  ...(process.env.BASE44_PREVIEW_MODE === '1'
    ? {
        server: {
          proxy: {
            '/api': {
              target: 'https://base44.app',
              changeOrigin: true,
            },
          },
        },
      }
    : {}),
})
