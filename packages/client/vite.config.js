import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Redirige les appels API vers le serveur Express
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Redirige les connexions Socket.io vers le serveur
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
