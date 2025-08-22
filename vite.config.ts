import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "client/src") } },
  server: {
    host: true,
    port: 5175,       // keep the working port
    strictPort: false, // fail fast if busy
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "") // <- strip /api
      }
    }
  },
  build: { chunkSizeWarningLimit: 800 }
});
