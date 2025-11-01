// ✅ FINAL FIXED VITE CONFIG (Vercel + Three.js)
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/",

  // ⚡ Add this line 👇 (forces Vite to include 3D assets)
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.hdr"],

  optimizeDeps: {
    exclude: ["stats-gl"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  define: {
    "process.env": {},
  },
});
