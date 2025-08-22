import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/supabase-auth';
import { storage } from '../storage';

const router = Router();
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** POST /api/ext/tokens  { label?, project_id?, hours? } -> { token, expires_at } */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { label, project_id, hours = 720 } = req.body || {};
  const raw = crypto.randomBytes(24).toString('base64url');
  const token_hash = sha256(raw);
  const expires_at = new Date(Date.now() + hours * 3600 * 1000);

  try {
    const client = (storage as any).client;
    await client.query(
      `insert into public.ext_tokens (user_id, project_id, label, token_hash, expires_at)
       values ($1,$2,$3,$4,$5)`,
      [user.id, project_id ?? null, label ?? null, token_hash, expires_at]
    );

    res.json({ token: raw, expires_at });
  } catch (error) {
    console.error('[ext-tokens] Create error:', error);
    res.status(500).json({ error: 'Failed to create extension token' });
  }
});

/** DELETE /api/ext/tokens/:id */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const client = (storage as any).client;
    await client.query(`delete from public.ext_tokens where id = $1 and user_id = $2`, [req.params.id, user.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('[ext-tokens] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete extension token' });
  }
});

/** GET /api/ext/tokens - list user's tokens */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const client = (storage as any).client;
    const result = await client.query(
      `select id, label, project_id, scope, last_used_at, expires_at, created_at 
       from public.ext_tokens 
       where user_id = $1 
       order by created_at desc`,
      [user.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('[ext-tokens] List error:', error);
    res.status(500).json({ error: 'Failed to list extension tokens' });
  }
});

export default router;