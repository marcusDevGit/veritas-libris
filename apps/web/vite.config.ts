import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Redireciona chamadas /api para o backend Fastify (porta 3333) evitando problemas de CORS em desenvolvimento
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
