import { Router } from "express";
import { z } from "zod";
import { listSignals, updateSignalStatus, insertSignal } from "../services/signals";

const router = Router();

// Auth middleware assumed earlier in /api chain
// GET /api/signals?projectId=&status=
router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || req.headers["x-user-id"]; // your auth attaches user; fallback for dev
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { projectId, status } = req.query as any;
    const rows = await listSignals({ userId, projectId, status });
    res.json({ rows });
  } catch (err) { next(err); }
});

// PATCH /api/signals/:id/status  { status: 'confirmed' | 'needs_edit' | 'unreviewed' }
router.patch("/:id/status", async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const body = z.object({ status: z.enum(["unreviewed","confirmed","needs_edit"]) }).parse(req.body);
    const updated = await updateSignalStatus(req.params.id, userId, body.status);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

// (DEV ONLY) seed a sample signal to verify end-to-end; NOOP in production
router.post("/_dev/seed", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") return res.status(404).end();
    const userId = (req as any).user?.id || (req.headers["x-user-id"] as string) || "00000000-0000-0000-0000-000000000000";
    const sample = await insertSignal({
      user_id: userId,
      project_id: null,
      capture_id: null,
      title: "Sample signal: Influencer fatigue accelerates long-form trust",
      summary: "Creators report burnout; audiences reward slower formats with deeper receipts.",
      truth_chain: {
        fact: "Multiple top creators paused weekly output citing burnout.",
        observation: "Longer explainers see higher watch time and saves.",
        insight: "Audiences trade frequency for depth when trust is scarce.",
        human_truth: "People follow those who admit limits and teach what they learn.",
        cultural_moment: "Return of 'guide' creators vs. trend-chasing clips."
      },
      cohorts: ["Creators seeking sustainability","Research-driven viewers"],
      strategic_moves: ["Ship series-based formats","Publish receipts alongside claims"],
      evidence: [{quote:"'I'm slowing down to make better videos'", url:"https://example.com/post", timestamp:new Date().toISOString(), source:"Reddit"}],
      confidence: 0.78,
      why_this_surfaced: "Recent cluster in 3 projects referencing 'burnout' + 'long-form'",
      source: "manual",
      origin: "web",
      status: "unreviewed"
    });
    res.json(sample);
  } catch (err) { next(err); }
});

export default router;