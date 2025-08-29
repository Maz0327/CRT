import { Pool } from "pg";
import { analyzeGroup } from "../services/truth/group";

export function startTruthGroupWorker(pool: Pool, opts: { intervalMs: number }) {
  const { intervalMs } = opts;
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      const { rows } = await pool.query(
        `select id, target_id
           from analysis_jobs
          where status='pending' and target_type='group'
          order by created_at asc
          limit 1`
      );
      if (!rows.length) return;
      const job = rows[0];

      await pool.query(`update analysis_jobs set status='running', attempts=attempts+1, updated_at=now() where id=$1`, [job.id]);

      try {
        const { checkId } = await analyzeGroup(pool, job.target_id);
        await pool.query(`update analysis_jobs set status='complete', updated_at=now() where id=$1`, [job.id]);
        // Also mark a truth_checks row for this group as complete if it was queued earlier (best effort)
        await pool.query(`update truth_checks set status='complete', completed_at=now() where group_id=$1 and status in ('pending','running')`, [job.target_id]);
        console.log(`[truth-group-worker] complete job ${job.id} → check ${checkId}`);
      } catch (err: any) {
        await pool.query(`update analysis_jobs set status='error', error=$2, updated_at=now() where id=$1`, [job.id, String(err?.message || err)]);
        await pool.query(`update truth_checks set status='error', error=$2, completed_at=now() where group_id=$1 and status in ('pending','running')`, [job.target_id, String(err?.message || err)]);
        await pool.query(`update analysis_jobs set status='error', error=$2, updated_at=now() where id=$1`, [job.id, String(err?.message || err)]);
        console.error("[truth-group-worker] job failed", job.id, err);
      }
    } finally {
      running = false;
    }
  }

  // Reduce frequency from 4 seconds to 30 seconds in development
    const interval = process.env.NODE_ENV === 'development' ? 30000 : 4000;
    setInterval(() => this.processGroups(), interval);
  console.log(`[truth-group-worker] started, interval=${intervalMs}ms`);
}