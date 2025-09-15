import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { runReadModelPipeline } from '../workers/analysis/pipeline';
import { storage } from '../storage';

const r = Router();

// ADMIN: trigger read-model pipeline for a capture
r.post('/captures/:id/rebuild-readmodel', requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    // fetch media path (however you store it; fallback if not found)
    const client = (storage as any).client;
    const result = await client.query(`SELECT id, storage_path FROM captures WHERE id=$1`, [id]);
    const cap = result.rows[0];
    const mediaPath = cap?.storage_path || '';
    
    await runReadModelPipeline(id, mediaPath);
    res.json({ ok: true, message: 'Analysis pipeline completed' });
  } catch (error) {
    console.error('Error running analysis pipeline:', error);
    res.status(500).json({ error: 'Failed to run analysis pipeline' });
  }
});

export default r;