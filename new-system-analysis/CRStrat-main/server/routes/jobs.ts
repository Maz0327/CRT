import { Router, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/supabase-auth";
import { z } from "zod";
import { validateBody, ValidatedRequest } from "../middleware/validate";
import { dbQueue } from "../jobs/dbQueue";
import { problem } from "../utils/problem";
import { heavyLimiter, publicLimiter } from "../middleware/rateLimit";

export const jobsRouter = Router();

const aiEnqueueSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  platform: z.string().optional().default("web"),
});

jobsRouter.post(
  "/jobs/enqueue/ai-analyze",
  heavyLimiter,
  requireAuth,
  validateBody(aiEnqueueSchema),
  async (req: ValidatedRequest<z.infer<typeof aiEnqueueSchema>> & AuthedRequest, res: Response) => {
    try {
      const { title, content, platform } = req.validated!.body!;
      const job = await dbQueue.enqueue("ai.analyze", { title, content, platform }, req.user!.id);
      res.status(202).json({ jobId: job.id, status: job.status });
    } catch (error) {
      return problem(res, 500, "Failed to enqueue job", (error as Error).message);
    }
  }
);

const truthEnqueueSchema = z.object({
  content: z.string().min(1),
  platform: z.string().optional().default("web"),
  metadata: z.record(z.any()).optional().default({}),
});

jobsRouter.post(
  "/jobs/enqueue/truth-analyze",
  heavyLimiter,
  requireAuth,
  validateBody(truthEnqueueSchema),
  async (req: ValidatedRequest<z.infer<typeof truthEnqueueSchema>> & AuthedRequest, res: Response) => {
    try {
      const { content, platform, metadata } = req.validated!.body!;
      const job = await dbQueue.enqueue("truth.analyze", { content, platform, metadata }, req.user!.id);
      res.status(202).json({ jobId: job.id, status: job.status });
    } catch (error) {
      return problem(res, 500, "Failed to enqueue job", (error as Error).message);
    }
  }
);

// GET /api/jobs/:id
jobsRouter.get("/jobs/:id", publicLimiter, requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const job = await dbQueue.get(req.params.id);
    if (!job) return problem(res, 404, "Job not found");
    res.json({ id: job.id, status: job.status, result: job.result, error: job.error, attempts: job.attempts });
  } catch (error) {
    return problem(res, 500, "Failed to fetch job", (error as Error).message);
  }
});

export default jobsRouter;