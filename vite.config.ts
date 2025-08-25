import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const worfHost = process.env.WORF_HOST || "60011746-76d1-4a07-8b52-69bb642792b8-00-7v62f6wvgff1.worf.replit.dev";

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "client/src") } },
  server: {
    host: true,
    port: 5175,
    strictPort: false,
    // Explicitly allow your Replit preview host (prevents "Blocked request" error)
    allowedHosts: [worfHost, "localhost", "127.0.0.1"],
    // Make HMR connect over WSS to your Replit host so hot-reload works reliably
    hmr: {
      host: worfHost,
      protocol: "wss",
      clientPort: 443
    },
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "")
      }
    }
  },
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 800
  }
});
