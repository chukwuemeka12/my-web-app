import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures assets are loaded correctly in SharePoint
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Optimize the bundle size
    rollupOptions: {
      output: {
        manualChunks: undefined,
        compact: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
