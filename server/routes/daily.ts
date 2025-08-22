import type { Express } from "express";
import { storage } from "../storage";
import type { ProjectScopedRequest } from "../middleware/project-scope";

/**
 * Daily briefing returns user-level aggregates:
 * - broadFeed (user feeds regardless of project)
 * - recentAnalyses (latest truth_checks across projects for user)
 * - watchlist (subset of feeds marked watchlist=true)
 * - alerts (cross-project analytics summary)
 */
export function setupDailyRoutes(app: Express) {
  app.get("/api/daily-briefing", async (req, res) => {
    try {
      const r = req as ProjectScopedRequest;
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const client = (storage as any).client;

      // Broad feed (user_feeds)
      const feeds = await client.query(
        `select id, feed_url, title, is_active, project_id
         from public.user_feeds
         where user_id = $1
         order by created_at desc
         limit 50`,
        [userId]
      );

      // Watchlist subset
      const watchlist = await client.query(
        `select id, feed_url, title, is_active, project_id
         from public.user_feeds
         where user_id = $1 and coalesce(watchlist, false) = true
         order by created_at desc
         limit 50`,
        [userId]
      );

      // Recent analyses (truth_checks)
      const analyses = await client.query(
        `select id, project_id, source_type, source_url, created_at
           from public.truth_checks
          where user_id = $1
          order by created_at desc
          limit 20`,
        [userId]
      );

      // Alerts: sample analytics (last 24h)
      const alerts = await client.query(
        `select metric_type, sum(metric_value) as total
           from public.analytics_data
          where user_id = $1
            and recorded_at > now() - interval '24 hours'
          group by metric_type
          order by total desc`,
        [userId]
      );

      return res.json({
        broadFeed: feeds.rows,
        watchlist: watchlist.rows,
        recentAnalyses: analyses.rows,
        alerts: alerts.rows,
      });
    } catch (err) {
      console.error("daily-briefing error:", err);
      return res.status(500).json({ error: "daily-briefing failed" });
    }
  });
}