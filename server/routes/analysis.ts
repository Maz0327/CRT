import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/supabase-auth";
import { analysisService } from "../services/analysisService";

const router = Router();

// Upload + create capture + analyze (for Chrome extension / file uploads)
router.post("/captures/upload-and-analyze", requireAuth, analysisService.uploadAndAnalyze);

// Trigger (re)analysis for an existing capture (decides sync vs deep)
router.post("/captures/:id/analyze", requireAuth, analysisService.analyzeExisting);

// Get latest analysis for a capture
router.get("/captures/:id/analysis", requireAuth, analysisService.getLatestForCapture);

// Optional: check job status by id
router.get("/analysis/:jobId", requireAuth, analysisService.getJobStatus);

export default router;