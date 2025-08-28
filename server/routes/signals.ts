import { Router, type Request, type Response } from "express";
import { createSignal, confirmSignal, needsEditSignal, listSignals } from "../services/signals";
import type { SignalStatus } from "../types/signals";

const router = Router();

// Expect req.user.id to exist (auth middleware). If not, fallback to header for dev.
function getUserId(req: Request): string {
  // @ts-ignore
  const uid = req.user?.id || (req.headers["x-user-id"] as string) || "";
  if (!uid) throw new Error("Unauthorized: missing user id");
  return uid;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = (req.query.projectId as string) || "";
    const status = (req.query.status as SignalStatus | undefined) || undefined;
    const userId = getUserId(req);
    const rows = await listSignals(userId, projectId, status);
    res.json(rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const created = await createSignal(userId, req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

router.post("/:id/confirm", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const updated = await confirmSignal(userId, req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

router.post("/:id/needs-edit", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const updated = await needsEditSignal(userId, req.params.id, req.body?.notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

export default router;