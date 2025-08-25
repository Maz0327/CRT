import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),             // <— serve client/
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "client/src") } },
  server: {
    host: true,
    port: 5175,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, "")
      }
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),           // <— write to repo/dist
    chunkSizeWarningLimit: 800
  }
});
