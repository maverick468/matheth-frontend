import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress React Fast Refresh and plugin warning errors during build
        if (
          warning.plugin === 'vite:react-babel' || 
          warning.plugin === 'vite:react-refresh' || 
          warning.code === 'MODULE_LEVEL_DIRECTIVE'
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});