import { pg } from "../lib/pg";
import { recordSignalFeedback } from "./learning";

export type Signal = {
  id: string;
  project_id: string;
  created_by: string;
  source_capture_ids: string[];
  truth_check_id?: string;
  title: string;
  summary: string;
  truth_fact?: string;
  truth_observation?: string;
  truth_insight?: string;
  truth_human_truth?: string;
  truth_cultural_moment?: string;
  strategic_moves: string[];
  cohorts: string[];
  receipts: Array<{
    quote: string;
    url: string;
    timestamp: string;
    source: string;
  }>;
  receipts_count?: number;
  confidence?: number;
  why_surfaced?: string;
  status: "unreviewed" | "confirmed" | "needs_edit";
  origin: string;
  source_tag?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateSignalInput = {
  projectId: string;
  created_by: string;
  source_capture_ids?: string[];
  truth_check_id?: string;
  title: string;
  summary: string;
  truth_chain?: {
    fact: string;
    observation: string;
    insight: string;
    human_truth: string;
    cultural_moment: string;
  };
  strategic_moves?: string[];
  cohorts?: string[];
  receipts?: Array<{
    quote: string;
    url: string;
    timestamp: string;
    source: string;
  }>;
  confidence?: number;
  why_surfaced?: string;
  origin?: string;
  source_tag?: string;
};

export async function listSignals(opts: { userId: string; projectId?: string; status?: string }) {
  const params: any[] = [opts.userId];
  let i = 2;
  let where = "created_by = $1";
  if (opts.projectId) { where += ` AND project_id = $${i++}`; params.push(opts.projectId); }
  if (opts.status) { where += ` AND status = $${i++}`; params.push(opts.status); }
  
  const { rows } = await pg.query(
    `SELECT * FROM public.signals WHERE ${where} ORDER BY updated_at DESC LIMIT 200`,
    params
  );
  return rows;
}

export async function createSignal(input: CreateSignalInput): Promise<Signal> {
  const { rows } = await pg.query(
    `INSERT INTO public.signals
     (project_id, created_by, source_capture_ids, truth_check_id, title, summary, truth_fact, truth_observation, truth_insight, truth_human_truth, truth_cultural_moment, strategic_moves, cohorts, receipts, confidence, why_surfaced, origin, source_tag)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      input.projectId,
      input.created_by,
      input.source_capture_ids || [],
      input.truth_check_id || null,
      input.title,
      input.summary,
      input.truth_chain?.fact || null,
      input.truth_chain?.observation || null,
      input.truth_chain?.insight || null,
      input.truth_chain?.human_truth || null,
      input.truth_chain?.cultural_moment || null,
      input.strategic_moves || [],
      input.cohorts || [],
      JSON.stringify(input.receipts || []),
      input.confidence || null,
      input.why_surfaced || null,
      input.origin || 'analysis',
      input.source_tag || null
    ]
  );
  return rows[0];
}

export async function confirmSignal(signalId: string, userId: string): Promise<Signal | null> {
  const client = await pg.getClient();
  try {
    await client.query('BEGIN');
    
    // Update signal status
    const { rows } = await client.query(
      `UPDATE public.signals SET status = 'confirmed' 
       WHERE id = $1 AND created_by = $2 RETURNING *`,
      [signalId, userId]
    );
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    
    // Insert feedback record
    await client.query(
      `INSERT INTO public.signal_feedback (signal_id, user_id, action) 
       VALUES ($1, $2, 'confirm')`,
      [signalId, userId]
    );
    
    await client.query('COMMIT');
    
    // Record learning event
    await recordSignalFeedback({
      projectId: rows[0].project_id,
      signalId,
      action: 'confirm'
    });
    
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function needsEditSignal(signalId: string, userId: string, notes?: string): Promise<Signal | null> {
  const client = await pg.getClient();
  try {
    await client.query('BEGIN');
    
    // Update signal status
    const { rows } = await client.query(
      `UPDATE public.signals SET status = 'needs_edit' 
       WHERE id = $1 AND created_by = $2 RETURNING *`,
      [signalId, userId]
    );
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    
    // Insert feedback record
    await client.query(
      `INSERT INTO public.signal_feedback (signal_id, user_id, action, notes) 
       VALUES ($1, $2, 'needs_edit', $3)`,
      [signalId, userId, notes || null]
    );
    
    await client.query('COMMIT');
    
    // Record learning event
    await recordSignalFeedback({
      projectId: rows[0].project_id,
      signalId,
      action: 'needs_edit'
    });
    
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}