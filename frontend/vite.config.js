// ✅ Import essentials
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// ✅ FINAL CONFIG — Works with Vercel + Render backend + Three.js (no 404 or black screen)
export default defineConfig({
  plugins: [react()],

  // 🧩 CRITICAL FIX: use relative base path for static Vercel deployment
  base: "./",

  // ⚡ Optimization for faster builds
  optimizeDeps: {
    exclude: ["stats-gl"], // Optional fix for Three.js tools
  },

  // 💡 Aliases for clean imports (like "@/components/Sidebar")
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 💻 Local development settings
  server: {
    port: 5173,
    proxy: {
      // 🔗 Local backend proxy (only works in dev)
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 🏗️ Build optimization (for production)
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // ✅ Keeps build files consistent & unique
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  // 🧠 Define process.env to silence Vite warnings
  define: {
    "process.env": {},
  },
});
