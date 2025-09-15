import { Router, Express } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const r = Router();

// k-NN by cosine similarity on text embeddings
r.get('/similar', requireAuth, async (req: Request, res: Response) => {
  try {
    const { captureId, k = '10' } = req.query as { captureId?: string; k?: string };
    if (!captureId) return res.status(400).json({ error: 'captureId required' });

    const client = (storage as any).client;

    // get embedding for the anchor capture
    const baseResult = await client.query(`
      SELECT embedding, model, dim FROM media_text_embeddings
      WHERE capture_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [captureId]);

    if (baseResult.rows.length === 0) {
      return res.json({ data: [] });
    }

    const base = baseResult.rows[0];

    const result = await client.query(`
      SELECT mte.capture_id, c.title, 1 - (mte.embedding <=> $1::vector) AS score
      FROM media_text_embeddings mte
      JOIN captures c ON c.id = mte.capture_id
      WHERE mte.capture_id <> $2
      ORDER BY mte.embedding <=> $1::vector
      LIMIT $3::int
    `, [base.embedding, captureId, k]);

    res.json({ data: result.rows, model: base.model, dim: base.dim });
  } catch (error) {
    console.error('Error searching similar captures:', error);
    res.status(500).json({ error: 'Failed to search similar captures' });
  }
});

export function setupSearchRoutes(app: Express) {
  app.use('/api/search', r);
}

export default r;