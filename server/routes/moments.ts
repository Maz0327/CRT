import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/supabase-auth';
import { initSSE, sendSSE, keepAlive } from '../lib/sse';
import { storage } from '../storage';

const router = Router();

/** Filter to the calling user's projects (ownership) */
async function allowedProjectIds(userId: string): Promise<string[]> {
  try {
    const projects = await storage.getProjects(userId);
    return projects.map(p => p.id);
  } catch (error) {
    console.error('[moments] Error getting user projects:', error);
    return [];
  }
}

/** GET /api/moments */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { q, projectId, page = '1', pageSize = '20', window = '24h' } = req.query as Record<string,string>;
  const pageNum = Math.max(1, parseInt(page));
  const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
  const table = window === '24h' ? 'moments_read_24h' : 'moments';
  const offset = (pageNum - 1) * sizeNum;

  const allowed = await allowedProjectIds(user.id);
  if (allowed.length === 0) return res.json({ data: [], page: 1, pageSize: sizeNum, total: 0 });

  try {
    // Use the storage client to query
    const client = (storage as any).client;
    const where: string[] = ['project_id = any($1)'];
    const params: any[] = [allowed];
    if (projectId) { params.push(projectId); where.push(`project_id = $${params.length}`); }
    if (q) { params.push(`%${q}%`); where.push(`title ilike $${params.length}`); }
    const whereSql = `where ${where.join(' and ')}`;

    const listSql = `
      select * from public.${table}
      ${whereSql}
      order by intensity desc nulls last
      limit ${sizeNum} offset ${offset};
    `;
    const countSql = `select count(*)::int as total from public.${table} ${whereSql};`;

    const [listResult, countResult] = await Promise.all([
      client.query(listSql, params),
      client.query(countSql, params)
    ]);

    res.json({ 
      data: listResult.rows, 
      page: pageNum, 
      pageSize: sizeNum, 
      total: countResult.rows[0]?.total ?? 0 
    });
  } catch (error) {
    console.error('[moments] Query error:', error);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

/** SSE: /api/moments/stream */
router.get('/stream', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const allowed = await allowedProjectIds(user.id);
  if (allowed.length === 0) {
    res.status(204).end();
    return;
  }

  initSSE(res);
  sendSSE(res, 'hello', { ok: true, at: Date.now() });

  const tick = async () => {
    try {
      const client = (storage as any).client;
      const result = await client.query(
        `select * from public.moments_read_24h where project_id = any($1) order by intensity desc nulls last limit 30`,
        [allowed]
      );
      sendSSE(res, 'moments', result.rows);
      keepAlive(res);
    } catch (e) {
      console.error('[moments] Stream error:', e);
      sendSSE(res, 'error', { message: 'stream query failed' });
    }
  };

  // initial + interval
  tick();
  const interval = setInterval(tick, 10000);
  req.on('close', () => clearInterval(interval));
});

/** POST /api/moments/refresh (manual) */
router.post('/refresh', requireAuth, async (_req: Request, res: Response) => {
  try {
    const client = (storage as any).client;
    await client.query(`refresh materialized view concurrently public.moments_read_24h;`, []);
    res.json({ ok: true });
  } catch (error) {
    console.error('[moments] Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh moments view' });
  }
});

export default router;