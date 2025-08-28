import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { analyzeTruthBundle } from "../services/truth/pipeline";
import { getTruthCheckById } from "../services/truth/store";

export default function mountTruthRoutes(app: Express) {
  app.get("/api/truth/health", (_req: Request, res: Response) =>
    res.json({ ok: true })
  );

  // Simple text analysis (single input)
  app.post("/api/truth/analyze-text", requireAuth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const projectId = (req.headers["x-project-id"] as string) || null;
    const { text, title } = req.body || {};
    const out = await analyzeTruthBundle({
      userId,
      projectId,
      input: { text, title },
    });
    if ((out as any).error) return res.status(400).json(out);
    return res.json(out);
  });

  // Bundle analysis (URLs, screenshots, capture snippets)
  app.post("/api/truth/analyze-bundle", requireAuth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const projectId = (req.headers["x-project-id"] as string) || null;
    const { title, text, urls, imageUrls, captureSnippets } = req.body || {};
    const out = await analyzeTruthBundle({
      userId,
      projectId,
      input: { title, text, urls, imageUrls, captureSnippets },
    });
    if ((out as any).error) return res.status(400).json(out);
    return res.json(out);
  });

  app.get("/api/truth/check/:id", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const found = await getTruthCheckById(id);
    if (!found) return res.status(404).json({ error: "not_found" });

    // Optional: scope enforcement (ensure record belongs to user or project)
    if (found.check.user_id !== userId) {
      // TODO: allow collaborators; for now, enforce strict ownership
      return res.status(403).json({ error: "forbidden" });
    }
    return res.json(found);
  });

  // Group analysis route (placeholder)
  app.post("/api/truth/analyze-group", requireAuth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { groupId } = req.body || {};
    
    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }

    try {
      // TODO: Implement group analysis logic
      return res.json({ 
        success: true, 
        message: "Group analysis started",
        groupId 
      });
    } catch (error: any) {
      return res.status(500).json({ 
        error: "Failed to start group analysis",
        details: error.message 
      });
    }
  });

  // Review truth check
  app.post("/api/truth/:checkId/review", requireAuth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const checkId = req.params.checkId;
    const { status, note } = req.body || {};

    // Validate status
    if (!status || !['confirmed', 'needs_edit'].includes(status)) {
      return res.status(400).json({ error: "status must be 'confirmed' or 'needs_edit'" });
    }

    try {
      // First, check if the check exists and user has access
      const existingCheck = await getTruthCheckById(checkId);
      if (!existingCheck) {
        return res.status(404).json({ error: "Truth check not found" });
      }

      // Check user access (ensure user owns this check)
      if (existingCheck.check.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update review fields using raw query for now
      const { pg } = await import("../lib/pg");
      const updateQuery = `
        UPDATE public.truth_checks 
        SET review_status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const { rows } = await pg.query(updateQuery, [
        status,
        note || null,
        userId,
        checkId
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Truth check not found" });
      }

      return res.json({ 
        success: true, 
        check: rows[0] 
      });

    } catch (error: any) {
      console.error("Error reviewing truth check:", error);
      return res.status(500).json({ 
        error: "Failed to review truth check",
        details: error.message 
      });
    }
  });
}