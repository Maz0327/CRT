import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Try to reuse your existing app from server/index.ts (if it exports one)
let app: any;
try {
  const mod = await import("./index");
  app = (mod as any).app ?? (mod as any).default;
} catch {
  app = express();
}

// Resolve built client directory (support both layouts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const candidates = [
  path.resolve(__dirname, "../client/dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "dist"),
];
const clientDir = candidates.find(d => fs.existsSync(path.join(d, "index.html"))) || candidates[1];

console.log("[prod-server] Serving static from:", clientDir);

// Static files (non-/api routes)
app.use((req: any, _res: any, next: any) => (req.url.startsWith("/api/") ? next() : next()));
app.use(express.static(clientDir, { index: "index.html", maxAge: "1h" }));
app.get("*", (req: any, res: any, next: any) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDir, "index.html"));
});

// Bind to Replit port
const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`[prod-server] listening on ${port} (NODE_ENV=${process.env.NODE_ENV})`);
});
