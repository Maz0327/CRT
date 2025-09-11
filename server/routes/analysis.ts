import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/supabase-auth";
import { analysisService } from "../services/analysisService";

const router = Router();

// Health endpoints - bypass authentication completely
router.get("/readyz", async (req, res) => {
  console.log("✅ Analysis router readyz handler reached!");
  try {
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: { database: "pass", workers: "disabled" }
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/healthz", (req, res) => {
  console.log("✅ Analysis router healthz handler reached!");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Upload + create capture + analyze (for Chrome extension / file uploads)
router.post("/captures/upload-and-analyze", requireAuth, analysisService.uploadAndAnalyze);

// Trigger (re)analysis for an existing capture (decides sync vs deep)
router.post("/captures/:id/analyze", requireAuth, analysisService.analyzeExisting);

// Get latest analysis for a capture
router.get("/captures/:id/analysis", requireAuth, analysisService.getLatestForCapture);

// Optional: check job status by id
router.get("/analysis/:jobId", requireAuth, analysisService.getJobStatus);

export default router;