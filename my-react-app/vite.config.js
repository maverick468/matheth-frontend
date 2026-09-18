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
  // Force Vite to pre-bundle legacy packages like MediaPipe for the browser
  optimizeDeps: {
    include: [
      '@mediapipe/hands',
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils'
    ]
  },
  build: {
    rollupOptions: {
      onwarn: () => {},
    },
  },
});