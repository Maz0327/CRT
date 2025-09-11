// server/routes/projects.ts
import { Router } from "express";
import {
  listProjectsForUser,
  createProject,
  userHasAccessToProject,
} from "../lib/db/projects";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all routes in this router
router.use(requireAuth);

// GET /api/projects -> Project[]
router.get("/projects", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    const list = await listProjectsForUser(req.user.id);
    return res.json(Array.isArray(list) ? list : []);
  } catch (e) {
    next(e);
  }
});

// POST /api/projects { name } -> Project
router.post("/projects", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    const name = String((req.body?.name ?? "")).trim();
    if (!name) return res.status(400).json({ error: "name_required" });
    const proj = await createProject(req.user.id, name);
    return res.status(201).json(proj);
  } catch (e) {
    next(e);
  }
});

// GET /api/projects/:id/access -> { ok: boolean }
router.get("/projects/:id/access", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    const ok = await userHasAccessToProject(req.user.id, req.params.id);
    return res.json({ ok });
  } catch (e) {
    next(e);
  }
});

export default router;