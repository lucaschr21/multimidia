// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // Qualquer chamada começando com /api...
        target: 'http://localhost:8000', // ...é enviada para o backend
        changeOrigin: true,
        // SEM 'rewrite' aqui
      }
    }
  }
})