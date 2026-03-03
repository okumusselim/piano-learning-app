import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split large vendor chunks
        manualChunks: {
          osmd: ['opensheetmusicdisplay'],
          tone: ['tone', '@tonejs/midi'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
