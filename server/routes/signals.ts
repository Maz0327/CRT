import type { Express, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { createSignal, confirmSignal, needsEditSignal, listSignals } from "../services/signals";

export default function registerSignalRoutes(app: Express) {
  // GET /api/signals?projectId=&status=
  app.get("/api/signals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { projectId, status } = req.query;
      
      const signals = await listSignals({
        userId,
        projectId: projectId as string,
        status: status as string
      });
      
      res.json(signals);
    } catch (error: any) {
      console.error("Error listing signals:", error);
      res.status(500).json({ error: "Failed to list signals", code: "LIST_SIGNALS_ERROR" });
    }
  });

  // POST /api/signals -> create or upsert signal
  app.post("/api/signals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const createSchema = z.object({
        projectId: z.string(),
        title: z.string().max(80),
        summary: z.string().max(280),
        truth_chain: z.object({
          fact: z.string(),
          observation: z.string(),
          insight: z.string(),
          human_truth: z.string(),
          cultural_moment: z.string()
        }).optional(),
        strategic_moves: z.array(z.string()).max(3).optional(),
        cohorts: z.array(z.string()).optional(),
        receipts: z.array(z.object({
          quote: z.string(),
          url: z.string(),
          timestamp: z.string(),
          source: z.string()
        })).optional(),
        confidence: z.number().min(0).max(1).optional(),
        why_surfaced: z.string().optional(),
        origin: z.string().default("analysis"),
        source_tag: z.string().optional(),
        source_capture_ids: z.array(z.string()).optional(),
        truth_check_id: z.string().optional()
      });
      
      const data = createSchema.parse(req.body);
      const signal = await createSignal({ ...data, created_by: userId });
      
      res.json(signal);
    } catch (error: any) {
      console.error("Error creating signal:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Validation error", details: error.errors, code: "VALIDATION_ERROR" });
      } else {
        res.status(500).json({ error: "Failed to create signal", code: "CREATE_SIGNAL_ERROR" });
      }
    }
  });

  // POST /api/signals/:id/confirm -> sets status='confirmed', inserts feedback
  app.post("/api/signals/:id/confirm", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const signalId = req.params.id;
      
      const signal = await confirmSignal(signalId, userId);
      if (!signal) {
        return res.status(404).json({ error: "Signal not found", code: "SIGNAL_NOT_FOUND" });
      }
      
      res.json(signal);
    } catch (error: any) {
      console.error("Error confirming signal:", error);
      res.status(500).json({ error: "Failed to confirm signal", code: "CONFIRM_SIGNAL_ERROR" });
    }
  });

  // POST /api/signals/:id/needs-edit -> sets status='needs_edit', optional notes, inserts feedback
  app.post("/api/signals/:id/needs-edit", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const signalId = req.params.id;
      
      const { notes } = req.body;
      
      const signal = await needsEditSignal(signalId, userId, notes);
      if (!signal) {
        return res.status(404).json({ error: "Signal not found", code: "SIGNAL_NOT_FOUND" });
      }
      
      res.json(signal);
    } catch (error: any) {
      console.error("Error marking signal as needs edit:", error);
      res.status(500).json({ error: "Failed to mark signal as needs edit", code: "NEEDS_EDIT_SIGNAL_ERROR" });
    }
  });

}