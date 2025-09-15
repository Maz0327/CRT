import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";
import crypto from "crypto";
import multer from "multer";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const r = Router();
r.use(requireAuth);

// Task Block #6: Enhanced captures list with analysis data and caching
// GET /api/captures?projectId=&platform=&q=&tags=tag1,tag2&label=&analyzed=true&date_from=&date_to=&page=1&pageSize=20
r.get("/", async (req, res) => {
  const userId = (req as any).user.id as string;
  const { 
    projectId, platform, q, tags, label, analyzed, 
    date_from, date_to, page = "1", pageSize = "20" 
  } = req.query as Record<string, string>;
  
  const tagList = tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [];
  const analyzedBool = analyzed !== undefined ? analyzed === "true" : undefined;

  try {
    const { rows, total, lastModified } = await storage.listCapturesWithAnalysis({
      userId, 
      projectId, 
      platform, 
      q, 
      tags: tagList,
      label,
      analyzed: analyzedBool,
      dateFrom: date_from,
      dateTo: date_to,
      page: parseInt(page), 
      pageSize: parseInt(pageSize)
    });

    // Implement ETag and Last-Modified caching
    const pageKey = `${userId}-${page}-${pageSize}-${projectId || ''}-${platform || ''}-${q || ''}-${tags || ''}-${label || ''}-${analyzed || ''}-${date_from || ''}-${date_to || ''}`;
    const payloadHash = crypto.createHash('md5').update(JSON.stringify(rows)).digest('hex');
    const etag = `"${pageKey}-${payloadHash}"`;
    
    if (lastModified) {
      res.set('Last-Modified', lastModified.toUTCString());
    }
    res.set('ETag', etag);

    // Check If-None-Match and If-Modified-Since
    const clientETag = req.headers['if-none-match'];
    const clientLastModified = req.headers['if-modified-since'];

    if (clientETag && clientETag === etag) {
      return res.status(304).end();
    }

    if (clientLastModified && lastModified) {
      const clientDate = new Date(clientLastModified);
      if (lastModified <= clientDate) {
        return res.status(304).end();
      }
    }

    res.json({ 
      rows, 
      total, 
      page: Number(page), 
      pageSize: Number(pageSize) 
    });
  } catch (error) {
    console.error("Error listing captures with analysis:", error);
    res.status(500).json({ error: "Failed to list captures" });
  }
});

// GET /api/captures/:id - Enhanced detail endpoint with analysis data
r.get("/:id", async (req, res) => {
  const userId = (req as any).user.id as string;
  const { id } = req.params;

  try {
    const capture = await storage.getCaptureWithAnalysis(id);
    
    if (!capture) {
      return res.status(404).json({ error: "Capture not found" });
    }

    // Verify user ownership
    if (capture.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(capture);
  } catch (error) {
    console.error("Error fetching capture detail:", error);
    res.status(500).json({ error: "Failed to fetch capture" });
  }
});

// PATCH /api/captures/:id/tags { add?: string[], remove?: string[] }
r.patch("/:id/tags", async (req, res) => {
  const userId = (req as any).user.id as string;
  const id = req.params.id;
  const body = z.object({
    add: z.array(z.string()).optional(),
    remove: z.array(z.string()).optional()
  }).parse(req.body);

  try {
    const updated = await storage.updateCaptureTags({ 
      id, 
      userId, 
      add: body.add ?? [], 
      remove: body.remove ?? [] 
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating capture tags:", error);
    res.status(500).json({ error: "Failed to update capture tags" });
  }
});

// --- Part 5: Multi-file upload endpoint ---
const MAX_BYTES = parseInt(process.env.CAPTURE_MAX_UPLOAD_BYTES || String(10 * 1024 * 1024), 10);
const MAX_FILES = parseInt(process.env.CAPTURE_MAX_BATCH || "10", 10);
const ALLOWED = (process.env.CAPTURE_ALLOWED_MIME || [
  "image/*", "application/pdf", "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
].join(",")).split(",");
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: MAX_FILES } });
function allowedType(m: string){ return ALLOWED.some(a => a.endsWith("/*") ? m.startsWith(a.slice(0,-2)) : m === a); }

r.post("/upload", requireAuth, memoryUpload.array("files", MAX_FILES), async (req, res) => {
  try {
    const userId = (req as any).user.id as string;
    const project_id = (req.body.project_id as string | undefined) || (req.query.projectId as string | undefined) || (req as any).projectId || null;
    const notesArr  = Array.isArray((req.body as any)["notes[]"])  ? (req.body as any)["notes[]"]  : ((req.body as any).notes  ? ([] as string[]).concat((req.body as any).notes)  : []);
    const titlesArr = Array.isArray((req.body as any)["titles[]"]) ? (req.body as any)["titles[]"] : ((req.body as any).title ? ([] as string[]).concat((req.body as any).title) : []);
    const tagsArr   = Array.isArray((req.body as any)["tags[]"])   ? (req.body as any)["tags[]"]   : ((req.body as any).tags   ? ([] as string[]).concat((req.body as any).tags)   : []);
    if (!req.files || (req.files as any[]).length === 0) return res.status(400).json({ error: "No files provided" });
    const created:any[] = [];
    let index = 0;
    for (const f of req.files as Express.Multer.File[]) {
      if (!allowedType(f.mimetype)) return res.status(415).json({ error: `Unsupported file type: ${f.mimetype}` });
      const ts = Date.now();
      const safe = f.originalname.replace(/\s+/g, "_");
      const key = `captures/${userId}/${ts}_${index}_${safe}`;
      const hash = crypto.createHash("sha256").update(f.buffer).digest("hex");
      let uploadedPath: string | null = null;
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { error } = await supabaseAdmin.storage.from(process.env.SUPABASE_STORAGE_BUCKET || "media").upload(key, f.buffer, { contentType: f.mimetype, upsert: false });
        if (!error) uploadedPath = key; else console.error("[captures.upload] storage upload failed:", error);
      }
      const tagsCsv = (tagsArr[index] || "").toString();
      const tags = tagsCsv.split(",").map((s:string)=>s.trim()).filter(Boolean);
      const title = titlesArr[index] || f.originalname;
      const notes = notesArr[index] || "";
      const rec = await storage.createCapture({
        userId, projectId: project_id || undefined, type: "upload", title, content: notes || null, url: null, platform: null,
        screenshotUrl: null, summary: null, tags, metadata: {}
      } as any);
      if (rec?.id && (uploadedPath || hash)) {
        // Update file_* fields via service-role (bypasses RLS safely)
        const { error: upErr } = await supabaseAdmin.from("captures").update({
          file_path: uploadedPath, file_type: f.mimetype, file_size: f.size, content_hash: hash, notes
        }).eq("id", rec.id);
        if (upErr) console.error("[captures.upload] update file meta failed:", upErr);
      }
      created.push(rec);
      index++;
    }
    return res.json({ ok: true, created });
  } catch (err) {
    console.error("[captures.upload] error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default r;