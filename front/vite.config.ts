import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
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
      "@observatoire-billets-train/shared": path.resolve(
        __dirname,
        "../shared/dist/index.js"
      ),
    },
  },
  optimizeDeps: {
    include: ["@observatoire-billets-train/shared"],
  },
}));
