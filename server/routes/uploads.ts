import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/supabase-auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { recordBriefAsset } from '../storage';

const router = Router();

const UploadReq = z.object({
  brief_id: z.string().uuid(),
  kind: z.enum(['image','video','graphic']),
  filename: z.string().min(1),
  contentType: z.string().min(1)
});

// Use Supabase Storage with signed URL (client uploads directly to storage)
router.post('/api/uploads/brief-asset', requireAuth, async (req, res) => {
  const user = (req as any).user!;
  
  try {
    const { brief_id, kind, filename, contentType } = UploadReq.parse(req.body || {});
    const storagePath = `briefs/${brief_id}/${Date.now()}-${filename}`;

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('brief-assets')
      .createSignedUploadUrl(storagePath);

    if (signErr) return res.status(400).json({ error: signErr.message });

    // Record asset metadata in database  
    try {
      await recordBriefAsset(supabaseAdmin, {
        brief_id,
        kind,
        storage_path: storagePath,
        mime: contentType
      });
    } catch (recordError) {
      console.error('Failed to record brief asset:', recordError);
      // Continue with upload URL even if recording fails
    }

    res.json({
      uploadUrl: signed.signedUrl,
      path: storagePath
    });
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    res.status(500).json({ error: 'Failed to create upload URL' });
  }
});

export default router;