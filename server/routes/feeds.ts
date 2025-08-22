import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";

const r = Router();
r.use(requireAuth);

// GET /api/feeds?projectId=
r.get("/", async (req, res) => {
  const userId = (req as any).user.id;
  const { projectId } = req.query as Record<string,string>;
  
  try {
    const rows = await storage.listUserFeedsForProject({ userId, projectId });
    res.json(rows);
  } catch (error) {
    console.error("Error listing feeds:", error);
    res.status(500).json({ error: "Failed to list feeds" });
  }
});

// POST /api/feeds { feed_url, title?, projectId? }
r.post("/", async (req, res) => {
  const userId = (req as any).user.id;
  const body = z.object({
    feed_url: z.string().url(),
    title: z.string().optional(),
    projectId: z.string().uuid().nullable().optional()
  }).parse(req.body);
  
  try {
    const row = await storage.createUserFeedWithValidation({ userId, ...body });
    res.status(201).json(row);
  } catch (error) {
    console.error("Error creating feed:", error);
    res.status(500).json({ error: "Failed to create feed" });
  }
});

// PATCH /api/feeds/:id/toggle
r.patch("/:id/toggle", async (req, res) => {
  const userId = (req as any).user.id;
  
  try {
    const row = await storage.toggleUserFeedStatus({ id: req.params.id, userId });
    res.json(row);
  } catch (error) {
    console.error("Error toggling feed:", error);
    res.status(500).json({ error: "Failed to toggle feed" });
  }
});

// DELETE /api/feeds/:id
r.delete("/:id", async (req, res) => {
  const userId = (req as any).user.id;
  
  try {
    await storage.deleteUserFeedWithValidation({ id: req.params.id, userId });
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting feed:", error);
    res.status(500).json({ error: "Failed to delete feed" });
  }
});

export default r;