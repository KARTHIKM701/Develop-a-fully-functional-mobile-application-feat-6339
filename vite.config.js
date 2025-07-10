import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2015',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'react-icons'],
          database: ['sql.js', 'uuid', 'crypto-js'],
          capacitor: [
            '@capacitor/core',
            '@capacitor/preferences',
            '@capacitor/device',
            '@capacitor/splash-screen',
            '@capacitor/status-bar'
          ]
        }
      }
    }
  },
  server: {
    host: true
  }
});