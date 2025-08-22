import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";

const r = Router();
r.use(requireAuth);

// GET /api/briefs?projectId=&q=&tags=&page=&pageSize=
r.get("/", async (req, res) => {
  const userId = (req as any).user.id;
  const { projectId, q, tags, page="1", pageSize="20" } = req.query as Record<string,string>;
  const tagList = tags ? tags.split(",").map(s=>s.trim()).filter(Boolean) : [];
  
  try {
    const result = await storage.listBriefsWithPagination({ 
      userId, projectId, q, tags: tagList, page: +page, pageSize: +pageSize 
    });
    res.json(result);
  } catch (error) {
    console.error("Error listing briefs:", error);
    res.status(500).json({ error: "Failed to list briefs" });
  }
});

// GET /api/briefs/:id
r.get("/:id", async (req, res) => {
  const userId = (req as any).user.id;
  
  try {
    const brief = await storage.getBriefWithDetails({ id: req.params.id, userId });
    if (!brief) return res.status(404).json({ error: "Not found" });
    res.json(brief);
  } catch (error) {
    console.error("Error getting brief:", error);
    res.status(500).json({ error: "Failed to get brief" });
  }
});

// POST /api/briefs  { title, projectId?, define_section?, shift_section?, deliver_section? }
r.post("/", async (req, res) => {
  const userId = (req as any).user.id;
  const create = z.object({
    title: z.string().min(1),
    projectId: z.string().uuid().nullable().optional(),
    define_section: z.any().optional(),
    shift_section: z.any().optional(),
    deliver_section: z.any().optional(),
    tags: z.array(z.string()).optional(),
  }).parse(req.body);

  try {
    const brief = await storage.createBriefWithSections({ userId, ...create });
    res.status(201).json(brief);
  } catch (error) {
    console.error("Error creating brief:", error);
    res.status(500).json({ error: "Failed to create brief" });
  }
});

// PATCH /api/briefs/:id  (partial update: sections/title/status/tags)
r.patch("/:id", async (req, res) => {
  const userId = (req as any).user.id;
  const patch = z.object({
    title: z.string().optional(),
    status: z.string().optional(),
    define_section: z.any().optional(),
    shift_section: z.any().optional(),
    deliver_section: z.any().optional(),
    tags: z.array(z.string()).optional(),
  }).parse(req.body);

  try {
    const brief = await storage.updateBriefWithSections({ id: req.params.id, userId, patch });
    res.json(brief);
  } catch (error) {
    console.error("Error updating brief:", error);
    res.status(500).json({ error: "Failed to update brief" });
  }
});

// PATCH /api/briefs/:id/tags { add?: string[], remove?: string[] }
r.patch("/:id/tags", async (req, res) => {
  const userId = (req as any).user.id;
  const { add = [], remove = [] } = z.object({
    add: z.array(z.string()).optional(),
    remove: z.array(z.string()).optional()
  }).parse(req.body);

  try {
    const brief = await storage.updateBriefTags({ id: req.params.id, userId, add, remove });
    res.json(brief);
  } catch (error) {
    console.error("Error updating brief tags:", error);
    res.status(500).json({ error: "Failed to update brief tags" });
  }
});

export default r;