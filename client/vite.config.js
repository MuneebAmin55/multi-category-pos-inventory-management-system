import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              id.includes('/react/')
            ) {
              return 'vendor-react';
            }
            if (
              id.includes('@reduxjs/toolkit') ||
              id.includes('react-redux') ||
              id.includes('redux-persist')
            ) {
              return 'vendor-redux';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
