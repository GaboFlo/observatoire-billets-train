import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("@tanstack")) {
              return "vendor-query";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "vendor-maps";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
