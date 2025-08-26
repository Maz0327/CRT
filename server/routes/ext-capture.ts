import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { requireExtToken } from '../middleware/ext-auth';
import { storage } from '../storage';

const upload = multer({ limits: { fileSize: 1024 * 1024 * 200 } }); // 200MB

const router = Router();

/** POST /api/ext/capture
 * headers: X-Ext-Token: <token>
 * body (multipart): media (file), title?, note?, url?, tags? (csv), platform?, project_id?
 */
router.post('/', requireExtToken, upload.single('media'), async (req: Request, res: Response) => {
  const ext = (req as any).ext as { userId: string; projectId?: string };
  const project_id = (req.body.project_id || ext.projectId) ?? null;
  const tags = (req.body.tags || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  let media_path: string | null = null;
  
  try {
    // Handle file upload if present
    if (req.file) {
      const timestamp = Date.now();
      const sanitizedName = req.file.originalname.replace(/\s+/g, '_');
      const key = `captures/${ext.userId}/${timestamp}_${sanitizedName}`;
      
      // Check if storage has put method, otherwise we'll need to implement file storage
      if (typeof (storage as any).put === 'function') {
        await (storage as any).put(key, req.file.buffer, { contentType: req.file.mimetype });
        media_path = key;
      } else {
        // For now, we'll store the file info but not the actual file
        // In a real implementation, you'd integrate with your file storage service
        console.log('[ext-capture] File upload received but storage.put not implemented:', {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
        media_path = `pending_upload_${timestamp}_${sanitizedName}`;
      }
    }

    // Create capture using storage interface
    const capture = await storage.createCapture({
      userId: ext.userId,
      projectId: project_id,
      title: req.body.title || 'Extension Capture',
      content: req.body.note || '',
      url: req.body.url || null,
      tags,
      platform: req.body.platform || null,
      screenshotUrl: media_path, // Using screenshotUrl field for media path
    });

    // Enqueue analysis if we have media
    if (media_path && req.file) {
      // Check if analysis enqueue service exists
      try {
        const { enqueueAnalysis } = await import('../services/analysis/enqueue');
        await enqueueAnalysis({ 
          capture_id: capture.id, 
          media_path, 
          priority: 'normal' 
        });
        console.log('[ext-capture] Analysis enqueued for capture:', capture.id);
      } catch (enqueueError) {
        console.log('[ext-capture] Analysis enqueue not available, skipping:', enqueueError.message);
      }
    }

    res.json({ ok: true, capture_id: capture.id });
    
  } catch (error) {
    console.error('[ext-capture] Error:', error);
    res.status(500).json({ error: 'Failed to process capture' });
  }
});

export default router;