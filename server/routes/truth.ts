import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/supabase-auth";
import { publicLimiter, heavyLimiter } from "../middleware/rateLimit";
import { env } from "../lib/env";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import fetch from "node-fetch";

const r = Router();

// ---------- Schemas ----------
const ExtractBody = z.object({
  projectId: z.string().uuid().optional(),
  url: z.string().url().optional(),
  text: z.string().min(1).optional(),
  imagePath: z.string().optional()
}).refine(v => !!(v.url || v.text || v.imagePath), { message: "Provide url, text, or imagePath" });

const AnalyzeQuery = z.object({
  quick: z.union([z.literal("true"), z.literal("false")]).default("true")
});

type TruthStatus = 'pending'|'extracting'|'ready_for_text'|'text_running'|'ready_for_visual'|'visual_running'|'done'|'error';

// ---------- Utils ----------
function stripHtml(html: string): string {
  const noScripts = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
  return noScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function okJson(res: any, data: any) {
  res.setHeader("Cache-Control", "no-store"); 
  return res.json(data);
}

async function updateStatus(id: string, status: TruthStatus, error?: string) {
  await supabaseAdmin.from("truth_checks").update({ status, error: error ?? null }).eq("id", id);
}

// ---------- POST /api/truth/extract ----------
r.post("/extract", publicLimiter, requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const body = ExtractBody.parse(req.body);
    const source_type = body.url ? "url" : body.text ? "text" : "image";

    let extracted_text: string | null = null;
    let extracted_images: any = null;

    if (body.url) {
      const resp = await fetch(body.url, { redirect: "follow" });
      const html = await resp.text();
      extracted_text = stripHtml(html);
      // naive image extraction (best-effort)
      const imgs = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).slice(0, 12).map(m=>m[1]);
      extracted_images = imgs;
    }

    if (body.text) {
      extracted_text = body.text;
    }

    const { data, error } = await supabaseAdmin.from("truth_checks").insert({
      user_id: user.id,
      project_id: body.projectId ?? null,
      source_type,
      source_url: body.url ?? null,
      source_text: body.text ?? null,
      source_image_path: body.imagePath ?? null,
      extracted_text,
      extracted_images,
      status: "ready_for_text"
    }).select("*").single();

    if (error) {
      console.error("[truth.extract] insert error", error);
      return res.status(500).json({ error: "extract failed" });
    }

    return okJson(res, { ok: true, check: data });
  } catch (err: any) {
    console.error("[truth.extract] error", err);
    return res.status(400).json({ error: err?.message || "bad request" });
  }
});

// ---------- POST /api/truth/analyze-text/:id?quick=bool ----------
r.post("/analyze-text/:id", heavyLimiter, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { quick } = AnalyzeQuery.parse(req.query);
  const isQuick = quick === "true";
  try {
    await updateStatus(id, isQuick ? "text_running" : "text_running");
    const { data: check, error } = await supabaseAdmin.from("truth_checks").select("id,extracted_text,content_hash").eq("id", id).single();
    if (error || !check) return res.status(404).json({ error: "not found" });

    if (!env.OPENAI_API_KEY) {
      await updateStatus(id, "ready_for_visual", "OPENAI_API_KEY required");
      return res.status(501).json({ error: "text analysis unavailable" });
    }

    const model = isQuick ? (process.env.OPENAI_MODEL_QUICK || "gpt-4o-mini") : (process.env.OPENAI_MODEL_DEEP || "gpt-4o");
    const sys = `You are a cultural insight analyst. Produce STRICT JSON with keys:
{
 "result_truth": { "fact":[], "observation":[], "insight":[], "human_truth":[], "cultural_moment":[] },
 "result_strategic": { "strategic_focus":"...", "competitive_intelligence":"..." },
 "result_cohorts": [ { "name":"", "description":"", "behaviors":[], "platforms":[], "size":"", "engagement":"" } ]
}
Keep outputs grounded in the provided text.`;

    const prompt = `TEXT:\n"""${check.extracted_text?.slice(0, 12000) || ""}"""\nReturn only the JSON structure.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });
    const out = await resp.json() as any;
    if (!resp.ok) {
      console.error("[truth.text] openai error", out);
      await updateStatus(id, "ready_for_visual", out?.error?.message ?? "openai error");
      return res.status(resp.status).json({ error: "openai failed", detail: out });
    }

    let parsed: any = {};
    try { parsed = JSON.parse(out.choices?.[0]?.message?.content || "{}"); } catch { parsed = {}; }

    const { error: upErr, data: updated } = await supabaseAdmin.from("truth_checks")
      .update({
        result_truth: parsed.result_truth || null,
        result_strategic: parsed.result_strategic || null,
        result_cohorts: parsed.result_cohorts || null,
        status: "ready_for_visual"
      }).eq("id", id).select("*").single();

    if (upErr) {
      console.error("[truth.text] update error", upErr);
      return res.status(500).json({ error: "persist failed" });
    }
    return okJson(res, { ok: true, check: updated });
  } catch (err: any) {
    console.error("[truth.text] error", err);
    await updateStatus(id, "error", err?.message || "text analyze failed");
    return res.status(500).json({ error: "text analyze failed" });
  }
});

// ---------- POST /api/truth/analyze-visual/:id?quick=bool ----------
r.post("/analyze-visual/:id", heavyLimiter, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { quick } = AnalyzeQuery.parse(req.query);
  const isQuick = quick === "true";
  try {
    await updateStatus(id, "visual_running");
    const { data: check, error } = await supabaseAdmin.from("truth_checks")
      .select("id,source_image_path,extracted_images").eq("id", id).single();
    if (error || !check) return res.status(404).json({ error: "not found" });

    if (!process.env.GOOGLE_API_KEY) {
      await updateStatus(id, "done", "GOOGLE_API_KEY required for visual");
      return res.status(501).json({ error: "visual analysis unavailable" });
    }

    // Best-effort: use Google Vision REST (LOGO/LABEL/OCR)
    const images: string[] = [];
    if (check.source_image_path) images.push(check.source_image_path);
    if (Array.isArray(check.extracted_images)) images.push(...check.extracted_images.slice(0, 3));

    // NOTE: This expects public URLs or GCS references. If your Supabase bucket is private, you'll need signed URLs.
    const requests = images.slice(0, isQuick ? 1 : 3).map((url: string) => ({
      image: { source: { imageUri: url } },
      features: [
        { type: "LOGO_DETECTION", maxResults: 5 },
        { type: "LABEL_DETECTION", maxResults: 10 },
        { type: "TEXT_DETECTION", maxResults: 10 }
      ]
    }));

    let result_visual: any = { items: [] };
    if (requests.length) {
      const vresp = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests })
      });
      const vjson = await vresp.json() as any;
      if (!vresp.ok) {
        console.error("[truth.visual] vision error", vjson);
      } else {
        result_visual = vjson;
      }
    }

    const { data: updated, error: upErr } = await supabaseAdmin.from("truth_checks")
      .update({ result_visual, status: "done" }).eq("id", id).select("*").single();

    if (upErr) {
      console.error("[truth.visual] update err", upErr);
      return res.status(500).json({ error: "persist failed" });
    }
    return okJson(res, { ok: true, check: updated });
  } catch (err: any) {
    console.error("[truth.visual] error", err);
    await updateStatus(id, "error", err?.message || "visual analyze failed");
    return res.status(500).json({ error: "visual analyze failed" });
  }
});

// ---------- GET /api/truth/check/:id ----------
r.get("/check/:id", publicLimiter, requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { data: check, error } = await supabaseAdmin.from("truth_checks")
      .select("*").eq("id", id).single();
    if (error || !check) return res.status(404).json({ error: "not found" });
    return okJson(res, check);
  } catch (err: any) {
    console.error("[truth.check] error", err);
    return res.status(500).json({ error: "failed to fetch check" });
  }
});

// ---------- POST /api/truth/retry/:id ----------
r.post("/retry/:id", heavyLimiter, requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await updateStatus(id, "pending");
    const { data: check, error } = await supabaseAdmin.from("truth_checks")
      .select("*").eq("id", id).single();
    if (error || !check) return res.status(404).json({ error: "not found" });
    return okJson(res, { ok: true, check });
  } catch (err: any) {
    console.error("[truth.retry] error", err);
    return res.status(500).json({ error: "retry failed" });
  }
});

// POST /api/truth/check?captureId=... OR ?groupId=...
r.post("/check", publicLimiter, requireAuth, async (req, res) => {
  try {
    const captureId = (req.query.captureId as string) || req.body.captureId;
    const groupId = (req.query.groupId as string) || req.body.groupId;
    if (!captureId && !groupId) return res.status(400).json({ error: "captureId or groupId required" });
    
    let id: string;
    const user = (req as any).user;
    
    if (groupId) {
      // Step 32 will implement real aggregator + analysis; for now, record the intent.
      id = await enqueueAnalysisForGroup(groupId, user?.id);
    } else {
      id = await enqueueAnalysisForCapture(captureId!, user?.id);
    }
    res.json({ status: "queued", checkId: id, target: groupId ? { groupId } : { captureId } });
  } catch (err: any) {
    console.error("[truth.check] error", err);
    return res.status(400).json({ error: err?.message || "bad request" });
  }
});

async function enqueueAnalysisForCapture(captureId: string, userId?: string): Promise<string> {
  // placeholder: insert pending row, return id
  return "pending-" + captureId;
}

async function enqueueAnalysisForGroup(groupId: string, userId?: string): Promise<string> {
  return "pending-group-" + groupId;
}

export default r;