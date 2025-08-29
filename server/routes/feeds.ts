import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import {
  createFeed,
  listFeeds,
  pullFeed,
  listFeedItems,
  normalizeUrl
} from "../services/feeds";

// Input validation schemas
const createFeedSchema = z.object({
  projectId: z.string().uuid(),
  feed_url: z.string().url(),
  title: z.string().optional()
});

const projectIdSchema = z.string().uuid();
const feedIdSchema = z.string().uuid();
const limitSchema = z.coerce.number().min(1).max(10).default(2);

export default function mountFeedsRoutes(app: Express) {
  
  // Create new feed
  app.post("/api/feeds", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = createFeedSchema.parse(req.body);
      
      // Validate URL format early
      try {
        normalizeUrl(body.feed_url);
      } catch (error) {
        return res.status(422).json({ 
          error: "Invalid feed URL format",
          details: "Please provide a valid HTTP or HTTPS URL"
        });
      }
      
      const result = await createFeed({
        projectId: body.projectId,
        createdBy: userId,
        feed_url: body.feed_url,
        title: body.title
      });
      
      console.log(`[feeds] Created new feed: ${result.id} for project ${body.projectId}`);
      
      return res.status(201).json({
        success: true,
        feed: result.feed
      });
      
    } catch (error: any) {
      console.error("[feeds] Error creating feed:", error);
      
      if (error.message === 'DUPLICATE_FEED') {
        return res.status(409).json({
          error: "Feed already exists",
          details: "This feed URL is already registered for this project"
        });
      }
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to create feed",
        details: error.message
      });
    }
  });
  
  // List feeds for project
  app.get("/api/feeds", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = projectIdSchema.parse(req.query.projectId);
      
      const feeds = await listFeeds({ projectId });
      
      return res.status(200).json({
        success: true,
        feeds
      });
      
    } catch (error: any) {
      console.error("[feeds] Error listing feeds:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Invalid project ID",
          details: "projectId query parameter is required and must be a valid UUID"
        });
      }
      
      return res.status(500).json({
        error: "Failed to list feeds",
        details: error.message
      });
    }
  });
  
  // Pull feed now (fetch and parse)
  app.post("/api/feeds/:id/pull", requireAuth, async (req: Request, res: Response) => {
    try {
      const feedId = feedIdSchema.parse(req.params.id);
      const projectId = req.headers["x-project-id"] as string || req.query.projectId as string;
      
      if (!projectId) {
        return res.status(400).json({
          error: "Missing project context",
          details: "Project ID required via X-Project-ID header or projectId query parameter"
        });
      }
      
      const validatedProjectId = projectIdSchema.parse(projectId);
      
      console.log(`[feeds] Pulling feed ${feedId} for project ${validatedProjectId}`);
      const startTime = Date.now();
      
      const result = await pullFeed({
        feedId,
        projectId: validatedProjectId
      });
      
      const duration = Date.now() - startTime;
      console.log(`[feeds] Pull completed in ${duration}ms: ${result.insertedCount} new items, status: ${result.status}`);
      
      return res.status(200).json({
        success: true,
        ...result
      });
      
    } catch (error: any) {
      console.error("[feeds] Error pulling feed:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Invalid parameters",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to pull feed",
        details: error.message
      });
    }
  });
  
  // Get feed items preview
  app.get("/api/feeds/:id/items", requireAuth, async (req: Request, res: Response) => {
    try {
      const feedId = feedIdSchema.parse(req.params.id);
      const projectId = req.headers["x-project-id"] as string || req.query.projectId as string;
      const limit = limitSchema.parse(req.query.limit);
      
      if (!projectId) {
        return res.status(400).json({
          error: "Missing project context",
          details: "Project ID required via X-Project-ID header or projectId query parameter"
        });
      }
      
      const validatedProjectId = projectIdSchema.parse(projectId);
      
      const items = await listFeedItems({
        feedId,
        projectId: validatedProjectId,
        limit
      });
      
      return res.status(200).json({
        success: true,
        items
      });
      
    } catch (error: any) {
      console.error("[feeds] Error listing feed items:", error);
      
      if (error.name === 'ZodError') {
        return res.status(422).json({
          error: "Invalid parameters",
          details: error.errors
        });
      }
      
      return res.status(500).json({
        error: "Failed to list feed items",
        details: error.message
      });
    }
  });
  
  // Health check
  app.get("/api/feeds/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      service: "feeds",
      timestamp: new Date().toISOString()
    });
  });
}