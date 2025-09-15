import { Express } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { storage } from "../storage";
import { GoogleSlidesService } from "../services/google/slides";
import { z } from "zod";

// Environment checks
const requiredGoogleEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_REDIRECT_URI'
];

function checkGoogleEnvironment(): { isConfigured: boolean; missing: string[] } {
  const missing = requiredGoogleEnvVars.filter(envVar => !process.env[envVar]);
  return {
    isConfigured: missing.length === 0,
    missing
  };
}

const exportSlidesSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
});

export function registerGoogleExportRoutes(app: Express) {
  const slidesService = new GoogleSlidesService();

  // Export brief to Google Slides
  app.post("/api/briefs/:id/export/slides", requireAuth, async (req, res) => {
    try {
      // Check if Google export is configured
      const envCheck = checkGoogleEnvironment();
      if (!envCheck.isConfigured) {
        console.warn(`Google export attempted but missing env vars: ${envCheck.missing.join(', ')}`);
        return res.status(400).json({ 
          error: "Google export not configured",
          message: `Missing required environment variables: ${envCheck.missing.join(', ')}. Please configure Google OAuth credentials.`,
          missing: envCheck.missing
        });
      }
      const userId = (req as any).user?.id;
      const briefId = req.params.id;
      const { title, templateId } = exportSlidesSchema.parse(req.body);

      // Get brief from database
      const brief = await storage.getBriefs(briefId);
      if (!brief || brief.length === 0) {
        return res.status(404).json({ error: "Brief not found" });
      }

      const briefData = brief[0];
      
      // Check if user owns this brief
      if ((briefData as any).user_id !== userId) {
        return res.status(403).json({ error: "Not authorized to export this brief" });
      }

      // Get brief canvas data (assuming it's stored in a canvas_json field)
      const canvasJson = (briefData as any).canvas_json || {
        slides: [
          {
            id: 'slide1',
            blocks: [
              {
                id: 'title',
                type: 'text',
                content: briefData.title || 'Untitled Brief',
                position: { x: 50, y: 50 },
                size: { width: 400, height: 100 }
              },
              {
                id: 'define',
                type: 'text',
                content: `Define: ${JSON.stringify((briefData as any).define_section)}`,
                position: { x: 50, y: 150 },
                size: { width: 600, height: 100 }
              },
              {
                id: 'shift',
                type: 'text',
                content: `Shift: ${JSON.stringify((briefData as any).shift_section)}`,
                position: { x: 50, y: 250 },
                size: { width: 600, height: 100 }
              },
              {
                id: 'deliver',
                type: 'text',
                content: `Deliver: ${JSON.stringify((briefData as any).deliver_section)}`,
                position: { x: 50, y: 350 },
                size: { width: 600, height: 100 }
              }
            ]
          }
        ]
      };

      // Create slides from canvas
      const result = await slidesService.createBriefFromCanvas({
        userId,
        projectId: (briefData as any).client_profile_id || 'default',
        title: title || briefData.title || 'Strategic Brief',
        canvasJson,
        templateId,
      });

      // Update brief with export information
      await storage.updateDsdBrief(briefId, {
        // @ts-expect-error legacy field
        drive_file_id: (result as any).driveFileId,
        slides_url: result.slidesUrl,
      });

      res.json({
        slidesUrl: result.slidesUrl,
        fileId: result.fileId,
        driveFileId: result.driveFileId,
      });

    } catch (error: any) {
      console.error("Error exporting brief to slides:", error);
      
      if (error.message.includes('Google tokens')) {
        return res.status(401).json({ 
          error: "Google authentication required",
          authUrl: "/api/auth/google"
        });
      }
      
      res.status(500).json({ error: "Failed to export brief to Google Slides" });
    }
  });

  // Get Google auth URL
  app.get("/api/auth/google", requireAuth, async (_req, res) => {
    try {
      const { GoogleOAuthService } = await import("../services/google/oauth");
      const oauthService = new GoogleOAuthService();
      
      const authUrl = oauthService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      res.status(500).json({ error: "Failed to get Google auth URL" });
    }
  });

  // Handle Google OAuth callback
  app.get("/api/auth/google/callback", requireAuth, async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Authorization code required" });
      }

      const { GoogleOAuthService } = await import("../services/google/oauth");
      const oauthService = new GoogleOAuthService();
      
      const tokens = await oauthService.getTokensFromCode(code);
      await oauthService.saveTokens((req as any).user?.id, tokens);

      res.json({ success: true, message: "Google authentication successful" });
    } catch (error) {
      console.error("Error handling Google OAuth callback:", error);
      res.status(500).json({ error: "Failed to complete Google authentication" });
    }
  });
}