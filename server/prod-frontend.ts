import type { Express, Request, Response } from "express";
import express from "express";
import path from "path";
import fs from "fs";

export default function mountProdFrontend(app: Express) {
  const distDir = path.resolve(process.cwd(), "client", "dist");
  const indexHtml = path.join(distDir, "index.html");

  if (fs.existsSync(indexHtml)) {
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => res.sendFile(indexHtml));
  } else {
    app.get("*", (_req: Request, res: Response) => {
      res.status(200).type("text/plain").send(
        "Frontend build not found. Run `npm run build` to generate client/dist."
      );
    });
  }
}
