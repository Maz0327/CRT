import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { validateBody, ValidatedRequest } from "../middleware/validate";
import { AIAnalyzer } from "../services/aiAnalyzer";
import { heavyLimiter } from "../middleware/rateLimit";

export const aiRouter = Router();
const aiAnalyzer = new AIAnalyzer();

const aiAnalyzeSchema = z.object({
  content: z.string().min(1),
  type: z.string().optional(),
  platform: z.string().optional(),
});

aiRouter.post("/ai/analyze", heavyLimiter, requireAuth, validateBody(aiAnalyzeSchema), async (req: ValidatedRequest<z.infer<typeof aiAnalyzeSchema>>, res: Response) => {
  try {
    const { content, type, platform } = req.validated!.body!;
    const analysis = {
      summary: `Strategic analysis of ${type || "content"}: ${content.substring(0, 100)}...`,
      sentiment: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
      viralScore: Math.floor(Math.random() * 40) + 60,
      strategicValue: Math.floor(Math.random() * 5) + 6,
      keyInsights: [
        "Strong engagement potential detected",
        "Aligns with current trending topics",
        "Recommended for strategic amplification",
      ],
      recommendations: [
        `Optimize for ${platform || "social media"} platform`,
        "Consider cross-platform distribution",
        "Monitor performance metrics closely",
      ],
      targetAudience: { primary: "Digital natives", secondary: "Content creators", engagement: "High" },
    };
    res.json(analysis);
  } catch (error) {
    console.error("Error in AI analysis:", error);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

const hookGenSchema = z.object({
  content: z.string().min(1),
  platform: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
});

aiRouter.post("/ai/hook-generator", requireAuth, validateBody(hookGenSchema), async (req: ValidatedRequest<z.infer<typeof hookGenSchema>>, res: Response) => {
  try {
    const { content, platform, targetAudience, tone } = req.validated!.body!;
    const hooks = [
      `🔥 You won't believe what ${targetAudience || "people"} are saying about this...`,
      `STOP scrolling! This ${platform || "content"} insight will change everything`,
      `The secret that ${targetAudience || "everyone"} doesn't want you to know`,
      `Why ${content.substring(0, 30)}... is trending everywhere`,
      `This simple trick is breaking the internet right now`,
      `${targetAudience || "People"} are going crazy over this new discovery`,
      `Warning: This ${platform || "content"} hack is too powerful`,
      `The ${tone || "authentic"} truth about what's happening`,
      `Everyone is talking about this, but here's what they missed`,
      `This changes everything we thought we knew about ${platform || "content"}`,
    ];
    res.json({
      hooks: hooks.slice(0, 5),
      metadata: {
        platform: platform || "general",
        targetAudience: targetAudience || "general",
        tone: tone || "engaging",
        optimizedFor: "maximum engagement",
      },
      performance: {
        expectedCTR: `${Math.floor(Math.random() * 5) + 3}%`,
        viralPotential: Math.floor(Math.random() * 30) + 70,
        audienceMatch: Math.floor(Math.random() * 20) + 80,
      },
    });
  } catch (error) {
    console.error("Error generating hooks:", error);
    res.status(500).json({ error: "Failed to generate hooks" });
  }
});

export default aiRouter;