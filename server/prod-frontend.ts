import path from "path";
import express, { Express } from "express";
import fs from "fs";

export default function mountProdFrontend(app: Express) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.log("[server] dev mode — not serving static frontend");
    return; // <- IMPORTANT: do nothing in dev
  }

  // In production, serve the built client app (client/dist)
  const rootDir = path.resolve(__dirname, "..");           // /server -> repo root
  const distDir = path.resolve(rootDir, "client", "dist");  // /client/dist

  if (!fs.existsSync(distDir)) {
    console.warn(`[server] WARN: ${distDir} not found. Build the client first (npm run build).`);
  } else {
    app.use(express.static(distDir));
    app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));
    console.log(`[server] serving static files from ${distDir}`);
  }
}
