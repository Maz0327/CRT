import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { validateBody, ValidatedRequest } from "../middleware/validate";
import { FixedBrightDataService } from "../services/fixedBrightDataService";
import { LiveBrightDataService } from "../services/liveBrightDataService";
import { heavyLimiter } from "../middleware/rateLimit";

export const brightDataRouter = Router();
const fixedBrightData = new FixedBrightDataService();
const liveBrightData = new LiveBrightDataService();

const brightFetchSchema = z.object({
  platform: z.string().min(1),
  keywords: z.array(z.string()).optional().default([]),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

brightDataRouter.post("/bright-data/fetch", heavyLimiter, requireAuth, validateBody(brightFetchSchema), async (req: ValidatedRequest<z.infer<typeof brightFetchSchema>>, res: Response) => {
  try {
    const { platform, keywords, limit } = req.validated!.body!;
    const data = await fixedBrightData.fetchPlatformData(platform, keywords, limit);
    res.json({
      success: true,
      platform,
      count: data.length,
      data,
      method: data[0]?.metadata?.source || "unknown",
    });
  } catch (error) {
    console.error("Error fetching via fixed Bright Data:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      details: error instanceof Error ? error.message : "Unknown error",
      platform: (req.validated?.body as any)?.platform,
    });
  }
});

const brightLiveSchema = z.object({
  platform: z.string().min(1),
  keywords: z.array(z.string()).optional().default([]),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

brightDataRouter.post("/bright-data/live", heavyLimiter, requireAuth, validateBody(brightLiveSchema), async (req: ValidatedRequest<z.infer<typeof brightLiveSchema>>, res: Response) => {
  try {
    const { platform, keywords, limit } = req.validated!.body!;
    const result = await liveBrightData.fetchLiveData(platform, keywords, limit);
    res.json(result);
  } catch (error) {
    console.error("Error fetching live data:", error);
    res.status(500).json({
      error: "Failed to fetch live data",
      details: error instanceof Error ? error.message : "Unknown error",
      platform: (req.validated?.body as any)?.platform,
    });
  }
});

export default brightDataRouter;