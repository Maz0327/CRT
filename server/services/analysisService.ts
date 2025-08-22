import type { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { getMediaProvider } from "./analysis";
import { storage } from "../storage";
import { toTags } from "./analysisTagMap";
import type { AuthedRequest } from "../middleware/supabase-auth";
import multer from "multer";
import { nanoid } from "nanoid";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const uploadMiddleware = upload.single('file');

// Extend AuthedRequest to include file property
interface FileRequest extends AuthedRequest {
  file?: Express.Multer.File;
}

// Request schemas
const UploadAnalyzeBody = z.object({
  project_id: z.string().uuid().optional(),
  title: z.string().optional(),
  source_url: z.string().url().optional(),
  platform: z.string().optional(),
  mode: z.enum(['sync', 'deep']).optional(),
});

const AnalyzeExistingBody = z.object({
  mode: z.enum(['sync', 'deep']).optional(),
});

function normalizeLabels(raw: any): { name: string; conf?: number; source?: string }[] {
  if (!raw || !Array.isArray(raw)) return [];
  
  return raw.slice(0, 20).map((item: any) => {
    if (typeof item === 'string') {
      return { name: item.toLowerCase() };
    }
    if (typeof item === 'object' && item.name) {
      return {
        name: item.name.toLowerCase(),
        conf: typeof item.confidence === 'number' ? item.confidence : item.conf,
        source: item.source || 'analysis'
      };
    }
    return { name: String(item).toLowerCase() };
  }).filter(item => item.name && item.name.trim().length > 0);
}

async function writeAnalysisRow(data: {
  capture_id: string;
  provider: string;
  mode: "sync" | "deep";
  status: string;
  summary?: string;
  labels?: any;
  ocr?: any;
  transcript?: string;
  keyframes?: any;
  raw?: any;
  error?: string;
}): Promise<any> {
  const { data: analysis, error } = await supabaseAdmin
    .from('capture_analyses')
    .insert({
      capture_id: data.capture_id,
      provider: data.provider,
      mode: data.mode,
      status: data.status,
      summary: data.summary || null,
      labels: data.labels || [],
      ocr: data.ocr || [],
      transcript: data.transcript || null,
      keyframes: data.keyframes || [],
      raw: data.raw || null,
      error: data.error || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error writing analysis row:', error);
    throw error;
  }
  
  return analysis;
}

async function maybeAutoTagCapture(captureId: string, labels: { name: string }[]): Promise<void> {
  if (process.env.AUTO_TAG_FROM_ANALYSIS !== "true") return;
  
  try {
    // Get current capture tags
    const { data: capture, error: fetchError } = await supabaseAdmin
      .from('captures')
      .select('tags')
      .eq('id', captureId)
      .single();
    
    if (fetchError || !capture) {
      console.error('Error fetching capture for auto-tagging:', fetchError);
      return;
    }
    
    // Convert labels to tags
    const newTags = toTags(labels);
    const existingTags = Array.isArray(capture.tags) ? capture.tags : [];
    
    // Merge and dedupe tags
    const allTags = [...existingTags, ...newTags];
    const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase()))).slice(0, 15);
    
    // Update capture with merged tags
    const { error: updateError } = await supabaseAdmin
      .from('captures')
      .update({ tags: uniqueTags, updated_at: new Date().toISOString() })
      .eq('id', captureId);
    
    if (updateError) {
      console.error('Error updating capture tags:', updateError);
    }
  } catch (error) {
    console.error('Error in auto-tagging:', error);
  }
}

export const analysisService = {
  uploadAndAnalyze: async (req: AuthedRequest, res: Response) => {
    uploadMiddleware(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed: ' + err.message });
      }
      
      try {
        const user = req.user!;
        const body = UploadAnalyzeBody.parse(req.body || {});
        const file = (req as FileRequest).file;
        
        if (!file) {
          return res.status(400).json({ error: 'No file provided' });
        }
        
        // Store file in 'media' bucket
        const fileName = `${user.id}/${nanoid()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('media')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        if (uploadError) {
          return res.status(500).json({ error: 'File storage failed: ' + uploadError.message });
        }
        
        // Create capture row with required projectId
        const captureData = {
          projectId: body.project_id || user.id, // Use user.id as fallback project
          userId: user.id,
          type: 'upload',
          title: body.title || file.originalname,
          content: null,
          url: body.source_url || null,
          platform: body.platform || 'upload',
          screenshotUrl: `media/${fileName}`,
          status: 'active',
        };
        
        const capture = await storage.createCapture(captureData);
        
        // Determine analysis mode
        const maxSyncSize = parseInt(process.env.ANALYSIS_MAX_SYNC_IMAGE_BYTES || '5242880');
        const shouldUseSync = file.size <= maxSyncSize;
        const mode = body.mode || (shouldUseSync ? 'sync' : 'deep');
        
        let analysisResult;
        let analysisStatus = 'completed';
        
        if (mode === 'sync') {
          try {
            // Run sync analysis
            const provider = getMediaProvider();
            const result = await provider.analyze({
              sourcePath: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
              kind: file.mimetype.startsWith('image/') ? 'image' : 'video',
              mode: 'quick',
              userId: user.id,
              hint: body.title || 'Uploaded file analysis'
            });
            
            // Normalize and write analysis
            const normalizedLabels = normalizeLabels(result.labels);
            analysisResult = await writeAnalysisRow({
              capture_id: capture.id,
              provider: process.env.MEDIA_PROVIDER || 'google',
              mode: 'sync',
              status: 'completed',
              summary: result.summary,
              labels: normalizedLabels,
              ocr: result.ocr || [],
              raw: { ...result, raw: undefined }, // trim raw response
            });
            
            // Auto-tag if enabled
            await maybeAutoTagCapture(capture.id, normalizedLabels);
            
          } catch (error: any) {
            console.error('Sync analysis error:', error);
            analysisResult = await writeAnalysisRow({
              capture_id: capture.id,
              provider: process.env.MEDIA_PROVIDER || 'google',
              mode: 'sync',
              status: 'failed',
              error: error.message,
            });
            analysisStatus = 'failed';
          }
        } else {
          // Queue for deep analysis
          analysisResult = await writeAnalysisRow({
            capture_id: capture.id,
            provider: process.env.MEDIA_PROVIDER || 'google',
            mode: 'deep',
            status: 'queued',
            summary: 'Queued for background processing',
          });
          analysisStatus = 'queued';
        }
        
        res.json({
          captureId: capture.id,
          analysisId: analysisResult.id,
          status: analysisStatus,
          mode: mode
        });
        
      } catch (error: any) {
        console.error('Upload and analyze error:', error);
        res.status(500).json({ error: error.message || 'Analysis failed' });
      }
    });
  },

  analyzeExisting: async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;
      const captureId = req.params.id;
      const body = AnalyzeExistingBody.parse(req.body || {});
      
      // Get capture and verify ownership
      const capture = await storage.getCaptureById(captureId);
      if (!capture || capture.userId !== user.id) {
        return res.status(404).json({ error: 'Capture not found' });
      }
      
      // Determine analysis mode based on file size or body preference
      const mode = body.mode || 'sync';
      const provider = getMediaProvider();
      
      let analysisResult;
      
      if (mode === 'sync') {
        try {
          // Get file from storage if available
          let sourcePath = capture.screenshotUrl;
          if (sourcePath && sourcePath.startsWith('media/')) {
            const { data: signedUrl } = await supabaseAdmin.storage
              .from('media')
              .createSignedUrl(sourcePath.replace('media/', ''), 3600);
            sourcePath = signedUrl?.signedUrl || sourcePath;
          }
          
          const result = await provider.analyze({
            sourcePath: sourcePath || capture.url || '',
            kind: 'image',
            mode: 'quick',
            userId: user.id,
            hint: capture.title || 'Existing capture analysis'
          });
          
          const normalizedLabels = normalizeLabels(result.labels);
          analysisResult = await writeAnalysisRow({
            capture_id: captureId,
            provider: process.env.MEDIA_PROVIDER || 'google',
            mode: 'sync',
            status: 'completed',
            summary: result.summary,
            labels: normalizedLabels,
            ocr: result.ocr || [],
            raw: { ...result, raw: undefined },
          });
          
          await maybeAutoTagCapture(captureId, normalizedLabels);
          
        } catch (error: any) {
          console.error('Analysis error:', error);
          analysisResult = await writeAnalysisRow({
            capture_id: captureId,
            provider: process.env.MEDIA_PROVIDER || 'google',
            mode: 'sync',
            status: 'failed',
            error: error.message,
          });
        }
      } else {
        // Queue for deep analysis
        analysisResult = await writeAnalysisRow({
          capture_id: captureId,
          provider: process.env.MEDIA_PROVIDER || 'google',
          mode: 'deep',
          status: 'queued',
          summary: 'Queued for background processing',
        });
      }
      
      res.json({
        analysisId: analysisResult.id,
        status: analysisResult.status,
        mode: mode
      });
      
    } catch (error: any) {
      console.error('Analyze existing error:', error);
      res.status(500).json({ error: error.message || 'Analysis failed' });
    }
  },

  getLatestForCapture: async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;
      const captureId = req.params.id;
      
      // Verify capture ownership
      const capture = await storage.getCaptureById(captureId);
      if (!capture || capture.userId !== user.id) {
        return res.status(404).json({ error: 'Capture not found' });
      }
      
      // Get latest analysis
      const { data: analysis, error } = await supabaseAdmin
        .from('capture_analyses')
        .select('*')
        .eq('capture_id', captureId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ analysis: analysis || null });
      
    } catch (error: any) {
      console.error('Get latest analysis error:', error);
      res.status(500).json({ error: error.message || 'Failed to get analysis' });
    }
  },

  getJobStatus: async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;
      const jobId = req.params.jobId;
      
      // Get analysis by ID and verify ownership through capture
      const { data: analysis, error } = await supabaseAdmin
        .from('capture_analyses')
        .select('*, captures!inner(user_id)')
        .eq('id', jobId)
        .single();
      
      if (error || !analysis || analysis.captures.user_id !== user.id) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json({
        jobId: analysis.id,
        status: analysis.status,
        result: analysis.status === 'completed' ? {
          summary: analysis.summary,
          labels: analysis.labels,
          ocr: analysis.ocr,
          transcript: analysis.transcript,
          keyframes: analysis.keyframes,
        } : null,
        error: analysis.error,
        createdAt: analysis.created_at,
      });
      
    } catch (error: any) {
      console.error('Get job status error:', error);
      res.status(500).json({ error: error.message || 'Failed to get job status' });
    }
  }
};