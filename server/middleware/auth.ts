import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../lib/supabase-admin"; // server-side client using SERVICE ROLE (do not expose to client)

export interface UserClaims {
  id: string;
  email?: string;
  role?: string | null;
}

export type AuthedRequest = Request & { user?: UserClaims };

declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // ---- HEALTH ENDPOINT BYPASS ----
    if (req.path === '/api/readyz' || req.path === '/api/healthz' || 
        req.path === '/readyz' || req.path === '/healthz') {
      return next();
    }
    // ---- END HEALTH ENDPOINT BYPASS ----

    // ---- DEV JWT SUPPORT (non-prod only) ----
    const isProd = process.env.NODE_ENV === "production";
    const allowDevBypass = !isProd;

    // Test mode bypass: if req.user is already set, skip auth verification
    if (req.user) {
      return next();
    }

    // Accept Bearer token
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // If non-prod and token is a DEV token, verify using DEV_JWT_SECRET
    if (allowDevBypass && process.env.DEV_JWT_SECRET) {
      try {
        const decoded: any = jwt.verify(token, process.env.DEV_JWT_SECRET);
        if (decoded && decoded.sub) {
          req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role ?? null,
          };
          return next();
        }
      } catch (_e) {
        // Not a dev token or invalid; fall through to Supabase verification
      }
    }

    // Verify via Supabase Admin (does NOT trust client)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid token" });

    req.user = { id: user.id, email: user.email || undefined, role: (user.user_metadata as any)?.role ?? null };
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: "Unauthorized", detail: e?.message });
  }
}