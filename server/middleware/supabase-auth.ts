import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

export interface AuthedUser {
  id: string;
  email: string;
  role?: string;
  metadata?: any;
}
export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

// Server-side client (service role key) for token inspection
const supabase = createClient(
  env.VITE_SUPABASE_URL || env.SUPABASE_URL || "",
  env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";

    // In development mode, allow all requests without authentication
    if (env.NODE_ENV !== "production") {
      (req as AuthedRequest).user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@contentradar.com',
        role: 'admin'
      };
      return next();
    }

    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Invalid token" });

    (req as AuthedRequest).user = { id: data.user.id, email: data.user.email || "" };
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
}