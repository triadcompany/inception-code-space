import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// In dev, proxy /api and /uploads to the local API server (default :8081).
// In production nginx serves both from the same origin.
const API_PROXY = process.env.VITE_API_PROXY || "http://localhost:8081";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": { target: API_PROXY, changeOrigin: true },
      "/uploads": { target: API_PROXY, changeOrigin: true },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
