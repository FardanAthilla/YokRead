import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-komiku': {
        target: 'https://weeb-scraper.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-komiku/, '/api'),
      },
    },
  },
})
