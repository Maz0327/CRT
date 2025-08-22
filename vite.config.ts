import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const hasClient = fs.existsSync(path.resolve(__dirname, "client"));
const root = hasClient ? path.resolve(__dirname, "client") : path.resolve(__dirname);

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@ui": path.resolve(root, "src/ui-v2"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://localhost:5000" },
  },
  build: {
    outDir: hasClient ? path.resolve(__dirname, "client/dist") : "dist",
    emptyOutDir: true,
  },
});
