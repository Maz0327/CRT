import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";

export default function mountAuthRoutes(app: Express) {
  // health for auth subsystem
  app.get("/api/auth/health", (_req: Request, res: Response) =>
    res.json({ ok: true, provider: "supabase", env: process.env.NODE_ENV })
  );

  // current user info (protected)
  app.get("/api/auth/whoami", requireAuth, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // (optional) stateless logout for clients that just drop token
  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    // client should delete its token; nothing to do server-side for stateless auth
    res.json({ ok: true });
  });
}