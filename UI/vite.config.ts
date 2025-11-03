// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://unindustrial-suzy-biggish.ngrok-free.dev",
        // target: "http://localhost:8000", comente a linha de cima e descomente esta caso o backend seja executado localmente
        changeOrigin: true,
      },
    },
  },
});
