import type { Express } from "express";
import express from "express";
import path from "path";
import fs from "fs";

export default function mountProdFrontend(app: Express) {
  // Resolve from project root in both tsx-run and compiled modes
  const DIST_DIR = path.resolve(process.cwd(), "client/dist");
  const INDEX_HTML = path.join(DIST_DIR, "index.html");

  if (!fs.existsSync(INDEX_HTML)) {
    console.warn("[prod-frontend] index.html not found at", INDEX_HTML);
    return;
  }

  app.use(express.static(DIST_DIR, { index: false, fallthrough: true }));

  // SPA fallback: any non-API route serves index.html
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api/")) return next();
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(INDEX_HTML);
  });

  console.log("[prod-frontend] serving static from", DIST_DIR);
}
