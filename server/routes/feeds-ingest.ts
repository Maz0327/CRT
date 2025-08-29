import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import {
  sendFeedItemToInbox,
  getIngestionStatus,
  listIngestions,
  getIngestionCount
} from "../services/feedsIngest";

// Input validation schemas
const sendToInboxSchema = z.object({
  feedItemId: z.string().uuid(),
  workspaceId: z.string().uuid()
});

const ingestionStatusSchema = z.object({
  feedItemId: z.string().uuid(),
  workspaceId: z.string().uuid()
});

const workspaceIdSchema = z.string().uuid();
const limitSchema = z.coerce.number().min(1).max(50).default(10);

export default function mountFeedsIngestRoutes(app: Express) {
  
  // Send feed item to inbox
  app.post("/api/feeds/ingest", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = sendToInboxSchema.parse(req.body);
      
      const result = await sendFeedItemToInbox({
        feedItemId: body.feedItemId,
        workspaceId: body.workspaceId,
        sentBy: userId
      });
      
      console.log(`[feeds-ingest] Feed item ${body.feedItemId} sent to inbox by user ${userId}`);
      
      return res.status(201).json({
        success: true,
        ingestion: result.ingestion
      });
      
    } catch (error: any) {
      console.error("[feeds-ingest] Error sending to inbox:", error);
      
      if (error.message === 'ALREADY_INGESTED') {
        return res.status(409).json({
          error: "Already sent to inbox",
          details: "This feed item has already been sent to the inbox"
        });
      }
      
      if (error.message === 'FEED_ITEM_NOT_FOUND') {
        return res.status(404).json({
          error: "Feed item not found",
          details: "The specified feed item does not exist or doesn't belong to this workspace"
        });
      }
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to send to inbox",
        details: error.message
      });
    }
  });

  // Check ingestion status for a feed item
  app.get("/api/feeds/ingest/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const query = ingestionStatusSchema.parse(req.query);
      
      const status = await getIngestionStatus({
        feedItemId: query.feedItemId,
        workspaceId: query.workspaceId
      });
      
      return res.json({
        success: true,
        status
      });
      
    } catch (error: any) {
      console.error("[feeds-ingest] Error getting ingestion status:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to get ingestion status",
        details: error.message
      });
    }
  });

  // List recent ingestions for a workspace
  app.get("/api/feeds/ingest/:workspaceId", requireAuth, async (req: Request, res: Response) => {
    try {
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      const limit = limitSchema.parse(req.query.limit);
      
      const ingestions = await listIngestions({
        workspaceId,
        limit
      });
      
      return res.json({
        success: true,
        ingestions
      });
      
    } catch (error: any) {
      console.error("[feeds-ingest] Error listing ingestions:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to list ingestions",
        details: error.message
      });
    }
  });

  // Get ingestion count for a workspace
  app.get("/api/feeds/ingest/:workspaceId/count", requireAuth, async (req: Request, res: Response) => {
    try {
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      
      const count = await getIngestionCount(workspaceId);
      
      return res.json({
        success: true,
        count
      });
      
    } catch (error: any) {
      console.error("[feeds-ingest] Error getting ingestion count:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to get ingestion count",
        details: error.message
      });
    }
  });
}