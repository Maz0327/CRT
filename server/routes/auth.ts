import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import jwt from "jsonwebtoken";

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

  // Dev-only: mint short-lived bearer token for HTTP golden tests
  app.post("/api/auth/dev-token", (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "not_found" });
    }
    const secret = process.env.DEV_JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "DEV_JWT_SECRET not configured" });
    }
    const payload = {
      sub: process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      role: "tester",
      iss: "crt-dev",
      aud: "crt-api",
    } as const;
    const token = jwt.sign(payload, secret, { expiresIn: "10m" });
    res.json({ token, expires_in: 600 });
  });
}