import { Router } from "express";
import { Pool } from "pg";

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Assumptions:
// - There is a `captures` table with columns:
//   id (uuid), project_id (uuid), user_id (uuid), title (text), url (text),
//   status (text default 'new'), tags (text[] default '{}'::text[]),
//   created_at (timestamptz default now()), updated_at (timestamptz default now())

// GET /api/captures?status=new|keep|trash
router.get("/captures", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    // projectId comes from project-scope middleware (Step 28)
    const projectId = (req as any).projectId as string | undefined;
    if (!projectId) return res.status(400).json({ error: "missing_project_scope" });

    const status = (req.query.status ? String(req.query.status) : null);
    const params: any[] = [projectId];
    let where = "project_id = $1";
    if (status && ["new", "keep", "trash"].includes(status)) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    const q = `
      SELECT id, project_id, user_id, title, url, status, tags, created_at, updated_at
      FROM captures
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const { rows } = await pool.query(q, params);
    return res.json(rows ?? []);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/captures/:id/status  { status: 'new'|'keep'|'trash' }
router.patch("/captures/:id/status", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    const projectId = (req as any).projectId as string | undefined;
    if (!projectId) return res.status(400).json({ error: "missing_project_scope" });

    const id = req.params.id;
    const status = String(req.body?.status ?? "");
    if (!["new", "keep", "trash"].includes(status)) {
      return res.status(400).json({ error: "invalid_status" });
    }

    const q = `
      UPDATE captures
      SET status = $1, updated_at = now()
      WHERE id = $2 AND project_id = $3
      RETURNING id, project_id, user_id, title, url, status, tags, created_at, updated_at
    `;
    const { rows } = await pool.query(q, [status, id, projectId]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;