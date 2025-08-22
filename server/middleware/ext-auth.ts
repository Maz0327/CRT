import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function requireExtToken(req: Request, res: Response, next: NextFunction) {
  const token = req.get('X-Ext-Token');
  if (!token) return res.status(401).json({ error: 'missing extension token' });

  try {
    const token_hash = sha256(token);
    const client = (storage as any).client;
    const result = await client.query(
      `select id, user_id, project_id, scope, expires_at
       from public.ext_tokens
       where token_hash = $1
       limit 1`,
      [token_hash]
    );
    
    const t = result.rows[0];
    if (!t) return res.status(401).json({ error: 'invalid token' });
    if (t.expires_at && new Date(t.expires_at) < new Date()) {
      return res.status(401).json({ error: 'token expired' });
    }

    (req as any).ext = { 
      tokenId: t.id, 
      userId: t.user_id, 
      projectId: t.project_id, 
      scope: t.scope 
    };
    
    // fire-and-forget last_used_at update
    client.query(`update public.ext_tokens set last_used_at = now() where id = $1`, [t.id])
      .catch((err) => console.error('[ext-auth] Failed to update last_used_at:', err));
    
    next();
  } catch (error) {
    console.error('[ext-auth] Token validation error:', error);
    return res.status(500).json({ error: 'token validation failed' });
  }
}