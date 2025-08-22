import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/supabase-auth';
import { storage } from '../storage';

const r = Router();

// Shots for a capture
r.get('/:id/shots', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT id, start_ms, end_ms, score
      FROM media_shots
      WHERE capture_id = $1
      ORDER BY start_ms ASC
    `, [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching shots:', error);
    res.status(500).json({ error: 'Failed to fetch shots' });
  }
});

// Keyframes for a capture (or shot)
r.get('/:id/keyframes', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { shotId } = req.query as { shotId?: string };
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT k.id, k.shot_id, k.ts_ms, k.storage_path, k.blur_score
      FROM media_keyframes k
      WHERE k.capture_id = $1
        ${shotId ? 'AND k.shot_id = $2' : ''}
      ORDER BY k.ts_ms ASC
    `, shotId ? [id, shotId] : [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching keyframes:', error);
    res.status(500).json({ error: 'Failed to fetch keyframes' });
  }
});

// Transcript segments
r.get('/:id/transcript', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT id, start_ms, end_ms, text, speaker
      FROM media_transcripts
      WHERE capture_id = $1
      ORDER BY start_ms NULLS FIRST
    `, [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// OCR
r.get('/:id/ocr', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT id, keyframe_id, text, bbox, conf
      FROM media_ocr
      WHERE capture_id = $1
    `, [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching OCR:', error);
    res.status(500).json({ error: 'Failed to fetch OCR' });
  }
});

// Detections
r.get('/:id/detections', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT id, keyframe_id, label, conf, bbox
      FROM media_detections
      WHERE capture_id = $1
    `, [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching detections:', error);
    res.status(500).json({ error: 'Failed to fetch detections' });
  }
});

// Captions per shot
r.get('/:id/captions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = (storage as any).client;
    const result = await client.query(`
      SELECT c.id, c.shot_id, c.summary, c.evidence, c.model, c.created_at
      FROM media_captions c
      WHERE c.capture_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching captions:', error);
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
});

export default r;