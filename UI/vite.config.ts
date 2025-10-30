// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ADICIONE ESTA SEÇÃO PARA "APONTAR" /api PARA O SEU BACKEND
  server: {
    proxy: {
      // Qualquer chamada que comece com /api...
      '/api': {
        // ...será redirecionada para o seu servidor Python
        target: 'http://localhost:8000', 
        changeOrigin: true,
      }
    }
  }
})