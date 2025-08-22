import { Express, Request, Response } from "express";
import { getUserFromRequest } from "./auth";
import { GoogleSlidesService } from "../services/google/slides";
import type { ExportJob } from "../types/dto";

// In-memory job storage for now (in production, use Redis or database)
const exportJobs = new Map<string, ExportJob>();

function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerExportJobsRoutes(app: Express) {
  const slidesService = new GoogleSlidesService();

  // Start export job
  app.post('/api/briefs/:id/export', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id: briefId } = req.params;
      const jobId = generateJobId();

      // Create job record
      const job: ExportJob = {
        jobId,
        status: 'pending'
      };
      
      exportJobs.set(jobId, job);

      // Start async export process
      setImmediate(async () => {
        try {
          // Use the existing Google Slides export
          const result = await slidesService.createSlidesDeck(
            user.id,
            briefId,
            'exported-brief', // Default project name
            briefId
          );

          // Update job status
          exportJobs.set(jobId, {
            jobId,
            status: 'completed',
            url: result.slideUrl
          });

        } catch (error) {
          console.error('Export job failed:', error);
          exportJobs.set(jobId, {
            jobId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Export failed'
          });
        }
      });

      res.json({ jobId });
    } catch (error) {
      console.error('Export job start error:', error);
      res.status(500).json({ error: 'Failed to start export job' });
    }
  });

  // Get job status
  app.get('/api/jobs/:jobId', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { jobId } = req.params;
      const job = exportJobs.get(jobId);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ error: 'Failed to get job status' });
    }
  });
}