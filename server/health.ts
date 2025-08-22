import type { Express } from "express";

export default function mountHealth(app: Express) {
  const health = (_req: any, res: any) =>
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development"
    });

  app.get("/healthz", health);
  app.get("/api/healthz", health);
}
