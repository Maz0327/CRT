import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { validateBody, ValidatedRequest, validateQuery } from "../middleware/validate";
import { storage } from "../storage";
import { StrategicIntelligenceService } from "../services/strategicIntelligenceService";
import { problem } from "../utils/problem";

export const intelligenceRouter = Router();

const strategicIntelligence = new StrategicIntelligenceService(storage);

// POST /api/intelligence/fetch
const intelFetchSchema = z.object({
  platforms: z.array(z.string()).min(1),
  keywords: z.array(z.string()).optional().default([]),
  competitors: z.array(z.string()).optional().default([]),
  timeWindow: z.string().optional().default("24h"),
  limit: z.number().int().min(1).max(200).optional().default(50),
});

intelligenceRouter.post(
  "/intelligence/fetch",
  requireAuth,
  validateBody(intelFetchSchema),
  async (req: ValidatedRequest<z.infer<typeof intelFetchSchema>>, res: Response) => {
    try {
      const { platforms, keywords, competitors, timeWindow, limit } = req.validated!.body!;
      const signals = await strategicIntelligence.fetchMultiPlatformIntelligence({
        platforms,
        keywords,
        competitors,
        timeWindow,
        limit,
      });
      res.json({ success: true, count: signals.length, signals });
    } catch (error) {
      console.error("Error fetching intelligence:", error);
      return problem(res, 500, "Failed to fetch intelligence", (error as Error).message);
    }
  }
);

// GET /api/intelligence/trends?timeWindow=7d
const trendsQuerySchema = z.object({
  timeWindow: z.string().optional().default("7d"),
});

intelligenceRouter.get(
  "/intelligence/trends",
  requireAuth,
  validateQuery(trendsQuerySchema),
  async (req: ValidatedRequest<unknown, z.infer<typeof trendsQuerySchema>>, res: Response) => {
    try {
      const { timeWindow } = req.validated!.query!;
      const trendReport = await strategicIntelligence.detectEmergingTrends(timeWindow);
      res.json(trendReport);
    } catch (error) {
      console.error("Error analyzing trends:", error);
      return problem(res, 500, "Failed to analyze trends", (error as Error).message);
    }
  }
);

export default intelligenceRouter;