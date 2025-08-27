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
}