import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { storage } from "../storage";
import { insertContentRadarSchema } from "@shared/supabase-schema";
import { problem } from "../utils/problem";
import { AIAnalyzer } from "../services/aiAnalyzer";

export const contentRouter = Router();
const aiAnalyzer = new AIAnalyzer();

// GET /api/content (with filters already applied in memory from captures)
contentRouter.get("/content", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const {
      type,
      platform,
      time,
      category,
      timeRange,
      sortBy,
      limit = "50",
      offset = "0",
    } = req.query as Record<string, string>;

    const captures = await storage.getUserCaptures(req.user!.id);
    let filtered = captures;

    if (platform && platform !== "all") {
      filtered = filtered.filter((c) => c.platform === platform);
    }

    const timeFilter = time || timeRange;
    if (timeFilter && timeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (timeFilter) {
        case "1h": cutoff.setHours(now.getHours() - 1); break;
        case "24h": cutoff.setDate(now.getDate() - 1); break;
        case "7d": cutoff.setDate(now.getDate() - 7); break;
        case "30d": cutoff.setDate(now.getDate() - 30); break;
      }
      filtered = filtered.filter((c) => c.createdAt && new Date(c.createdAt) >= cutoff);
    }

    if (type === "trending") {
      filtered = filtered
        .filter((c) => (c.viralScore && c.viralScore > 60) || c.analysisStatus === "completed" || !c.viralScore)
        .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0));
    }

    const off = parseInt(offset, 10);
    const lim = parseInt(limit, 10);

    const items = filtered.slice(off, off + lim).map((c) => ({
      id: c.id,
      title: c.title || `${c.platform} Signal`,
      description: c.summary || (c.content?.substring(0, 200) ?? "") + "...",
      platform: c.platform,
      url: c.url,
      viralScore: c.viralScore || 0,
      engagement: (c.metadata as any)?.engagement || "Unknown",
      createdAt: c.createdAt,
      tags: c.tags || [],
    }));

    res.json(items);
  } catch (error) {
    console.error("Error fetching content:", error);
    return problem(res, 500, "Failed to fetch content", (error as Error).message);
  }
});

// GET /api/content/:id
contentRouter.get("/content/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const item = await storage.getContentItemById(req.params.id);
    if (!item) return problem(res, 404, "Content not found");
    res.json(item);
  } catch (error) {
    return problem(res, 500, "Failed to fetch content item", (error as Error).message);
  }
});

// POST /api/content
contentRouter.post("/content", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const validated = insertContentRadarSchema.parse(req.body);
    const item = await storage.createContentItem(validated);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return problem(res, 400, "Invalid data", "Content payload failed validation", "BAD_REQUEST", { issues: error.errors });
    }
    return problem(res, 500, "Failed to create content item", (error as Error).message);
  }
});

// PATCH /api/content/:id
contentRouter.patch("/content/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const item = await storage.updateContentItem(req.params.id, req.body);
    if (!item) return problem(res, 404, "Content not found");
    res.json(item);
  } catch (error) {
    return problem(res, 500, "Failed to update content item", (error as Error).message);
  }
});

// DELETE /api/content/:id
contentRouter.delete("/content/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    await storage.deleteContentItem(req.params.id);
  } catch (error) {
    return problem(res, 500, "Failed to delete content item", (error as Error).message);
  }
  res.json({ success: true });
});

// POST /api/content/:id/hooks
contentRouter.post("/content/:id/hooks", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const item = await storage.getContentItemById(req.params.id);
    if (!item) return problem(res, 404, "Content not found");

    const existing = [item.hook1, item.hook2].filter(Boolean) as string[];
    const newHooks = await new AIAnalyzer().generateAdditionalHooks(
      item.title,
      item.content || "",
      existing
    );

    res.json({ hooks: newHooks });
  } catch (error) {
    return problem(res, 500, "Failed to generate hooks", (error as Error).message);
  }
});

// Optional: POST /api/content/scan (manual scan trigger) — keep behavior
contentRouter.post("/content/scan", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    // If you have a scheduler service available on import:
    const { scheduler } = await import("../services/scheduler");
    const result = await scheduler.manualScan();
    res.json({
      success: result.success,
      message: `Scan completed: ${result.itemsProcessed} items processed${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ""}`,
      itemsProcessed: result.itemsProcessed,
      errors: result.errors,
    });
  } catch (error) {
    return problem(res, 500, "Failed to run manual scan", (error as Error).message);
  }
});

export default contentRouter;