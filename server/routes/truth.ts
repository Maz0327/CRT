import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { analyzeTruthBundle } from "../services/truth/pipeline";

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

  // TODO (later step): GET /api/truth/check/:id to fetch saved result from DB
}