import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const analyticsFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  metricType: z.enum(['capture_volume', 'viral_score', 'engagement', 'trend']).optional(),
  timeframe: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export function setupAnalyticsRoutes(app: Express) {
  // Get dashboard metrics
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const metrics = await storage.getDashboardMetrics(req.session.user.id);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  });

  // Get analytics data with filters
  app.get('/api/analytics', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const filters = analyticsFilterSchema.parse(req.query);
      
      const data = await storage.getAnalyticsData({
        userId: req.session.user.id,
        projectId: filters.projectId,
        metricType: filters.metricType,
        timeframe: filters.timeframe,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      });

      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid filter parameters', details: error.errors });
      }
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // Get trend data for charts
  app.get('/api/analytics/trends', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { days = '7', projectId } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

      const trendData = await storage.getAnalyticsData({
        userId: req.session.user.id,
        projectId: projectId as string,
        startDate: daysAgo,
        timeframe: parseInt(days as string) > 30 ? 'weekly' : 'daily',
      });

      // Format for chart display
      const formattedData = trendData.reduce((acc: any[], item) => {
        const date = new Date(item.recordedAt ?? 0).toLocaleDateString();
        const existing = acc.find(d => d.date === date);
        
        if (existing) {
          existing[item.metricType] = parseFloat(item.metricValue);
        } else {
          acc.push({
            date,
            [item.metricType]: parseFloat(item.metricValue),
          });
        }
        
        return acc;
      }, []);

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      res.status(500).json({ error: 'Failed to fetch trend data' });
    }
  });

  // Record analytics event
  app.post('/api/analytics', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { projectId, metricType, metricValue, dimensions } = req.body;

      if (!metricType || metricValue === undefined) {
        return res.status(400).json({ error: 'metricType and metricValue are required' });
      }

      const data = await storage.createAnalyticsData({
        userId: req.session.user.id,
        projectId,
        metricType,
        metricValue,
        dimensions,
        timeframe: 'daily',
        aggregatedData: {},
      });

      res.status(201).json(data);
    } catch (error) {
      console.error('Error recording analytics:', error);
      res.status(500).json({ error: 'Failed to record analytics' });
    }
  });

  // Get platform breakdown
  app.get('/api/analytics/platforms', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const captures = await storage.getUserCaptures(req.session.user.id);
      
      const platformStats = captures.reduce((acc: any, capture) => {
        const platform = capture.platform || 'unknown';
        if (!acc[platform]) {
          acc[platform] = { count: 0, avgViralScore: 0, totalViralScore: 0 };
        }
        acc[platform].count++;
        if (capture.viralScore) {
          acc[platform].totalViralScore += capture.viralScore;
          acc[platform].avgViralScore = acc[platform].totalViralScore / acc[platform].count;
        }
        return acc;
      }, {});

      res.json(platformStats);
    } catch (error) {
      console.error('Error fetching platform breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch platform breakdown' });
    }
  });

  // Get project comparison
  app.get('/api/analytics/projects/compare', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projects = await storage.getProjects(req.session.user.id);
      
      const projectStats = await Promise.all(
        projects.map(async (project) => {
          const captures = await storage.getCaptures(project.id);
          
          return {
            id: project.id,
            name: project.name,
            captureCount: captures.length,
            avgViralScore: captures.reduce((sum, c) => sum + (c.viralScore || 0), 0) / (captures.length || 1),
            status: project.status,
          };
        })
      );

      res.json(projectStats);
    } catch (error) {
      console.error('Error comparing projects:', error);
      res.status(500).json({ error: 'Failed to compare projects' });
    }
  });
}