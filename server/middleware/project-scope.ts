import type { Request, Response, NextFunction } from "express";

export interface ProjectScopedRequest extends Request {
  projectId?: string | null;
}

/**
 * Reads project id from:
 *   1) header: X-Project-ID
 *   2) query:  projectId
 * Does not assert membership (RLS should still protect at DB level).
 */
export function projectScope(req: Request, _res: Response, next: NextFunction) {
  const hdr = req.get("X-Project-ID");
  const q = (req.query?.projectId as string | undefined) || undefined;
  (req as ProjectScopedRequest).projectId = hdr || q || null;
  next();
}