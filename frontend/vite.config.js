import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// FIX ZAROORI: Module resolution aur path aliases ke liye 'path' import kiya gaya hai.
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // User ki optimizeDeps settings rakhi gayi hain.
  optimizeDeps: {
    exclude: ['stats-gl'], // Optional fix for three.js stats-gl issue
  },
  // FIX CRITICAL: 'resolve' configuration joda gaya hai taaki "./App.jsx" jaisi files
  // aur future mein use hone waale path aliases ('@/') theek se resolve ho sakein.
  resolve: {
    alias: {
      // 'src' folder ko '@' symbol se refer kiya ja sakta hai (module resolution fix)
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Frontend port
    // Backend se communication ke liye proxy setting waapas jodi gayi hai.
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
