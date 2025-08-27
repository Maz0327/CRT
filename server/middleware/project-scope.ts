import { NextFunction, Request, Response } from "express";
import { storage } from "../storage";

declare global {
  namespace Express {
    interface Request {
      projectId?: string | null;
    }
  }
}

// Helper function to check if user has access to a project
async function hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
  try {
    const userProjects = await storage.getProjects(userId);
    return userProjects.some(project => project.id === projectId);
  } catch (error) {
    console.error("Error checking project access:", error);
    return false;
  }
}

// Helper function to get user's first owned/recent project ID
async function firstOwnedOrRecentProjectId(userId: string): Promise<string | null> {
  try {
    const userProjects = await storage.getProjects(userId);
    return userProjects.length > 0 ? userProjects[0].id : null;
  } catch (error) {
    console.error("Error getting default project:", error);
    return null;
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
      const hasAccess = await hasProjectAccess(req.user.id, headerId);
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