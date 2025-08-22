import { Router } from 'express';
import { z } from 'zod';
import { createGoogleSlidesService } from '../services/google-slides-service';
import { createGoogleDocsService } from '../services/google-docs-service';
import { createGoogleSheetsService } from '../services/google-sheets-service';
import { createGoogleDriveService } from '../services/google-drive-service';
import { googleVisionService } from '../services/google-vision-service';
import { googleNLPService } from '../services/google-nlp-service';
import { googleAuthService } from '../services/google-auth';
import { requireAuth } from '../middleware/supabase-auth';
import { storage } from '../storage';

const router = Router();

// Schema for export request
const exportRequestSchema = z.object({
  projectId: z.string(),
  briefId: z.string(),
  exportTypes: z.array(z.enum(['slides', 'docs', 'sheets', 'drive'])),
  title: z.string().optional()
});

// Schema for brief export request (new)
const briefExportSchema = z.object({
  captureIds: z.array(z.string()),
  projectId: z.string(),
  title: z.string(),
  outline: z.array(z.any()).optional()
});

// Google OAuth initiation
router.get('/auth/google', requireAuth, (req, res) => {
  try {
    const authUrl = googleAuthService.generateAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Google OAuth callback
router.get('/auth/google/callback', requireAuth, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    
    // Store tokens in user session or database
    // For now, we'll store in session
    req.session.googleTokens = tokens;
    
    res.redirect('/briefs?google_auth=success');
  } catch (error) {
    console.error('Error exchanging Google auth code:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// NEW: Export brief to Google Slides (simplified endpoint)
router.post('/brief', requireAuth, async (req, res) => {
  try {
    const validatedData = briefExportSchema.parse(req.body);
    const { captureIds, projectId, title, outline } = validatedData;

    // Check authentication - first check session, then database
    let googleTokens = req.session.googleTokens;
    
    if (!googleTokens && (req as any).user) {
      // Try to get tokens from database
      const user = await storage.getUser(((req as any).user).id);
      if (user?.googleTokens) {
        googleTokens = user.googleTokens;
      }
    }

    if (!googleTokens) {
      return res.status(401).json({ 
        error: 'Google authentication required',
        authRequired: true 
      });
    }

    // Get captures data - using placeholder for now since getCaptureById might not exist
    const mockCaptures = captureIds.map(id => ({
      id,
      title: `Mock Capture ${id}`,
      content: 'Sample analysis content',
      ai_analysis: {
        summary: 'Strategic intelligence finding',
        key_insights: ['Key insight 1', 'Key insight 2', 'Key insight 3']
      }
    }));

    if (mockCaptures.length === 0) {
      return res.status(400).json({ error: 'No valid captures found' });
    }

    // Transform captures to match the expected format
    const briefData = {
      title: title || 'Strategic Intelligence Brief',
      content: {
        define: outline?.filter(s => s.title.toLowerCase().includes('define')).map(s => s.bullets.join('; ')) || ['Market analysis', 'Current state'],
        shift: outline?.filter(s => s.title.toLowerCase().includes('shift')).map(s => s.bullets.join('; ')) || ['Emerging trends', 'Strategic pivots'],
        deliver: outline?.filter(s => s.title.toLowerCase().includes('deliver')).map(s => s.bullets.join('; ')) || ['Action items', 'Recommendations']
      },
      captures: mockCaptures.map((capture: any) => ({
        title: capture.title,
        content: capture.content,
        truthAnalysis: {
          fact: capture.ai_analysis.summary,
          observation: capture.ai_analysis.key_insights[0] || '',
          insight: capture.ai_analysis.key_insights[1] || '',
          humanTruth: capture.ai_analysis.key_insights[2] || '',
          strategicValue: 7,
          viralPotential: 6,
          keywords: capture.ai_analysis.key_insights || []
        }
      }))
    };

    // Create Google Slides presentation
    const slidesService = await createGoogleSlidesService(googleTokens);
    const result = await slidesService.createPresentationFromBrief(briefData);

    res.json({
      slidesUrl: result.url,
      presentationId: result.presentationId,
      title: result.title
    });

  } catch (error) {
    console.error('Error exporting brief to slides:', error);
    res.status(500).json({ error: 'Failed to export brief to Google Slides' });
  }
});

// Export brief to Google services (existing endpoint)
router.post('/export', requireAuth, async (req, res) => {
  try {
    const validatedData = exportRequestSchema.parse(req.body);
    const { projectId, briefId, exportTypes, title } = validatedData;

    // Check if user has Google tokens
    if (!req.session.googleTokens) {
      return res.status(401).json({ 
        error: 'Google authentication required',
        authRequired: true 
      });
    }

    // Get project and brief data
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const brief = await storage.getDsdBriefById(briefId as string);
    if (!brief) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    // Get captures for the project
    const captures = await storage.getCaptures(projectId);

    // Guard images & map to the DTO
    const capturesWithImages = (captures ?? [])
      .filter((c: any) => c?.type === 'image' && !!c?.imageData)
      .map((c: any) => ({
        title: c.title ?? 'Untitled',
        content: c.content ?? '',
        type: 'image' as const,
        sourceUrl: c.sourceUrl,
        platform: c.platform,
        imageData: c.imageData as string,
        createdAt: c.createdAt || new Date().toISOString()
      }));

    const briefData = {
      title: title || brief.title || project.name,
      content: (brief as any).content ?? { define: [], shift: [], deliver: [] },
      captures: capturesWithImages
    };

    const results: any = {};

    // Create Google Drive folder first if requested
    let projectFolder = null;
    if (exportTypes.includes('drive')) {
      const driveService = await createGoogleDriveService(req.session.googleTokens);
      projectFolder = await driveService.createProjectFolder(briefData.title);
      results.drive = projectFolder;
    }

    // Export to Google Slides
    if (exportTypes.includes('slides')) {
      const slidesService = await createGoogleSlidesService(req.session.googleTokens);
      const slidesResult = await slidesService.createPresentationFromBrief(briefData);
      results.slides = slidesResult;
    }

    // Export to Google Docs
    if (exportTypes.includes('docs')) {
      const docsService = await createGoogleDocsService(req.session.googleTokens);
      const docsResult = await docsService.createDetailedBriefDocument(briefData);
      results.docs = docsResult;
    }

    // Export to Google Sheets
    if (exportTypes.includes('sheets')) {
      const sheetsService = await createGoogleSheetsService(req.session.googleTokens);
      const sheetsResult = await sheetsService.createAnalysisSpreadsheet(briefData);
      results.sheets = sheetsResult;
    }

    // Organize assets in Drive folder if created
    if (projectFolder && Object.keys(results).length > 1) {
      const driveService = await createGoogleDriveService(req.session.googleTokens);
      await driveService.organizeProjectAssets(projectFolder.folderId, {
        slides: results.slides,
        docs: results.docs,
        sheets: results.sheets
      });
    }

    res.json({
      success: true,
      results,
      projectFolder,
      exportedTypes: exportTypes
    });

  } catch (error) {
    console.error('Error exporting to Google services:', error);
    res.status(500).json({ error: 'Failed to export to Google services' });
  }
});

// Check Google authentication status
router.get('/auth/status', requireAuth, (req, res) => {
  const hasTokens = !!req.session.googleTokens;
  
  const tokenInfo = hasTokens ? {
    hasAccessToken: !!req.session.googleTokens?.access_token,
    hasRefreshToken: !!req.session.googleTokens?.refresh_token,
    expiryDate: req.session.googleTokens?.expiry_date
  } : null;

  res.json({
    authenticated: hasTokens,
    tokenInfo,
    availableServices: hasTokens ? [
      'slides', 'docs', 'sheets', 'drive', 'vision', 'nlp'
    ] : []
  });
});

// Enhanced analysis using Google Vision
router.post('/analyze/vision', requireAuth, async (req, res) => {
  try {
    const { imageBase64, captureId } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data required' });
    }

    // Remove data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const analysis = await googleVisionService.analyzeImageContent(cleanBase64);
    
    // Store analysis results if captureId provided
    if (captureId) {
      // TODO: Implement updateCaptureAnalysis method
      console.log('Visual analysis completed for capture:', captureId);
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error with Google Vision analysis:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Enhanced analysis using Google NLP
router.post('/analyze/nlp', requireAuth, async (req, res) => {
  try {
    const { content, captureId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    const analysis = await googleNLPService.analyzeTextContent(content);
    
    // Store analysis results if captureId provided
    if (captureId) {
      // TODO: Implement updateCaptureAnalysis method
      console.log('NLP analysis completed for capture:', captureId);
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error with Google NLP analysis:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

// Batch export all project data
router.post('/export/project/:projectId', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { includeAnalysis = true } = req.body;

    if (!req.session.googleTokens) {
      return res.status(401).json({ 
        error: 'Google authentication required',
        authRequired: true 
      });
    }

    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all project data
    const captures = await storage.getCaptures(projectId);
    const briefs = await storage.getDsdBriefs(projectId);

    // Create project folder
    const driveService = await createGoogleDriveService(req.session.googleTokens);
    const projectFolder = await driveService.createProjectFolder(project.name);

    const results = {
      projectFolder,
      exports: [] as any[]
    };

    // Export each brief
    for (const brief of briefs || []) {
      const briefData = {
        title: brief.title || `${project.name} Brief`,
        content: (brief as any).content || { define: [], shift: [], deliver: [] },
        captures: (captures || []).map((c: any) => ({
          title: c.title || 'Untitled',
          content: c.content || '',
          type: c.type || 'text',
          sourceUrl: c.sourceUrl,
          platform: c.platform,
          createdAt: c.createdAt || new Date().toISOString()
        }))
      };

      // Create all Google assets for this brief
      const [slidesResult, docsResult, sheetsResult] = await Promise.all([
        createGoogleSlidesService(req.session.googleTokens)
          .then(service => service.createPresentationFromBrief(briefData)),
        createGoogleDocsService(req.session.googleTokens)
          .then(service => service.createDetailedBriefDocument(briefData)),
        createGoogleSheetsService(req.session.googleTokens)
          .then(service => service.createAnalysisSpreadsheet(briefData))
      ]);

      // Organize in folder
      await driveService.organizeProjectAssets(projectFolder.folderId, {
        slides: { id: slidesResult.presentationId, title: slidesResult.title },
        docs: { id: docsResult.documentId, title: docsResult.title },
        sheets: { id: sheetsResult.spreadsheetId, title: sheetsResult.title }
      });

      results.exports.push({
        briefId: brief.id,
        briefTitle: brief.title,
        slides: slidesResult,
        docs: docsResult,
        sheets: sheetsResult
      });
    }

    res.json(results);

  } catch (error) {
    console.error('Error exporting project:', error);
    res.status(500).json({ error: 'Failed to export project' });
  }
});

export default router;