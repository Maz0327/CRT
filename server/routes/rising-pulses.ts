import { Router, type Request, type Response } from "express";
import { listRisingPulses, getRisingPulse, createRisingPulse } from "../services/rising-pulses";

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
    if (!projectId) {
      return res.status(400).json({ error: "projectId parameter required" });
    }
    
    const rows = await listRisingPulses(projectId);
    res.json(rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const risingPulse = await getRisingPulse(req.params.id);
    if (!risingPulse) {
      return res.status(404).json({ error: "Rising pulse not found" });
    }
    res.json(risingPulse);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const created = await createRisingPulse(userId, req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

export default router;