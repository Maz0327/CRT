import { NextFunction, Request, Response } from "express";
import { userHasAccessToProject, firstOwnedOrRecentProjectId } from "../lib/db/projects";

declare global {
  namespace Express {
    interface Request {
      projectId?: string | null;
    }
  }
}

export async function projectScope(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      // Public endpoints may skip; authenticated endpoints should reject upstream
      req.projectId = null;
      return next();
    }

    const headerId = (req.headers["x-project-id"] as string | undefined)?.trim();
    let resolved: string | null = null;

    if (headerId) {
      // validate user access to headerId
      const hasAccess = await userHasAccessToProject(req.user.id, headerId);
      if (!hasAccess) return res.status(403).json({ error: "project_access_denied" });
      resolved = headerId;
    } else {
      // pick a default project for this user
      resolved = await firstOwnedOrRecentProjectId(req.user.id);
      // If still none, remain null — downstream endpoints should handle gracefully
    }

    req.projectId = resolved;
    return next();
  } catch (err) {
    return next(err);
  }
}