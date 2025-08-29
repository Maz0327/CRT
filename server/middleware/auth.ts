import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase-admin"; // server-side client using SERVICE ROLE (do not expose to client)

export interface UserClaims {
  id: string;
  email?: string;
  role?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Test mode bypass: if req.user is already set, skip auth verification
    if (req.user) {
      return next();
    }

    // Accept Bearer token or cookie (if you later set a cookie)
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // Verify via Supabase Admin (does NOT trust client)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid token" });

    req.user = { id: user.id, email: user.email || undefined, role: (user.user_metadata as any)?.role ?? null };
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: "Unauthorized", detail: e?.message });
  }
}