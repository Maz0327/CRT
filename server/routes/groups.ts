import { Router } from "express";
import { Pool } from "pg";
import { GroupStore } from "../services/groups/store";

// Simple async handler for cleaner error handling
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// We'll call into existing truth service; Step 32 will complete this wiring.
async function enqueueGroupTruthCheck(pool: Pool, groupId: string, userId: string) {
  await pool.query(`insert into truth_checks (group_id, status, created_at) values ($1,'pending', now())`, [groupId]);
  await pool.query(
    `insert into analysis_jobs (target_type, target_id, status) values ('group', $1, 'pending')`,
    [groupId]
  );
}

export function registerGroupRoutes(pool: Pool) {
  const router = Router();
  const store = new GroupStore(pool);

  router.post("/", asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id || req.body.userId; // prefer auth middleware, fallback for dev
    const projectId = req.header("X-Project-ID") || req.body.projectId;
    const name = req.body.name || "Untitled Group";
    if (!userId || !projectId) return res.status(400).json({ error: "userId and projectId required" });
    const group = await store.createGroup({ userId, projectId, name });
    res.status(201).json(group);
  }));

  router.get("/:id", asyncHandler(async (req: any, res: any) => {
    const data = await store.getGroup(req.params.id);
    if (!data) return res.status(404).json({ error: "group not found" });
    res.json(data);
  }));

  router.post("/:id/items", asyncHandler(async (req: any, res: any) => {
    const { captureId, position } = req.body;
    if (!captureId) return res.status(400).json({ error: "captureId required" });
    await store.addItem(req.params.id, captureId, position);
    res.status(204).end();
  }));

  router.delete("/:id/items/:captureId", asyncHandler(async (req: any, res: any) => {
    await store.removeItem(req.params.id, req.params.captureId);
    res.status(204).end();
  }));

  // Trigger analysis for the whole group
  router.post("/:id/analyze", asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ error: "userId required" });
    await enqueueGroupTruthCheck(pool, req.params.id, userId);
    res.json({ status: "queued", groupId: req.params.id });
  }));

  return router;
}