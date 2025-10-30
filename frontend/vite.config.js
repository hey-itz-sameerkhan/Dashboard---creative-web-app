import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// ✅ FINAL VITE CONFIG — Perfect for Vercel + Three.js + Render backend
export default defineConfig({
  plugins: [react()],

  // 🧩 Critical for Vercel — ensures assets load from correct root path
  base: "/",

  // ⚡ Improves performance & avoids rebuild issues
  optimizeDeps: {
    exclude: ["stats-gl"], // Optional fix for three.js monitoring tools
  },

  // ✅ Path aliases — clean imports like "@/components/Sidebar"
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 💻 Local development settings
  server: {
    port: 5173,
    // ✅ Proxy backend for local dev (Render not needed here)
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 🏗️ Build optimization for Vercel static hosting
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // ✅ Keeps file names stable across rebuilds
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  // 🧠 Silence known warnings from Three.js or fiber
  define: {
    "process.env": {},
  },
});
