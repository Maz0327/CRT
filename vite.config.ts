import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  // Serve the React app from client/
  root: path.resolve(__dirname, "client"),

  plugins: [react()],

  // Allow "@/..." imports to point to client/src
  resolve: {
    alias: { "@": path.resolve(__dirname, "client/src") },
  },

  server: {
    host: true,
    port: 5175,
    strictPort: false,

    // 👇 THIS is the fix you need
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      // your exact Replit preview host:
      "60011746-76d1-4a07-8b52-69bb642792b8-00-7v62f6wvgff1.worf.replit.dev",
    ],

    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },

  build: {
    // Output production build at repo root /dist (server serves this in prod)
    outDir: path.resolve(__dirname, "dist"),
    chunkSizeWarningLimit: 800,
  },
});
