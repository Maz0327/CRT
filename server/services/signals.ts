import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export type TruthChain = {
  fact: string;
  observation: string;
  insight: string;
  human_truth: string;
  cultural_moment: string;
};

export type Signal = {
  id: string;
  user_id: string;
  project_id?: string | null;
  capture_id?: string | null;
  title: string;
  summary: string;
  truth_chain: TruthChain;
  cohorts: string[];
  strategic_moves: string[];
  evidence: Array<Record<string, unknown>>;
  confidence?: number | null;
  why_this_surfaced?: string | null;
  source: "upload" | "extension" | "feed" | "manual" | "api" | "other";
  origin: string;
  status: "unreviewed" | "confirmed" | "needs_edit";
};

export async function listSignals(opts: { userId: string; projectId?: string; status?: string }) {
  const params: any[] = [opts.userId];
  let i = 2;
  let where = "user_id = $1";
  if (opts.projectId) { where += ` and project_id = $${i++}`; params.push(opts.projectId); }
  if (opts.status)    { where += ` and status = $${i++}`;     params.push(opts.status); }
  const { rows } = await pool.query(`select * from public.signals where ${where} order by created_at desc limit 200`, params);
  return rows;
}

export async function updateSignalStatus(id: string, userId: string, status: "unreviewed"|"confirmed"|"needs_edit") {
  const { rows } = await pool.query(
    `update public.signals set status = $1 where id = $2 and user_id = $3 returning *`,
    [status, id, userId]
  );
  return rows[0] ?? null;
}

export async function insertSignal(s: Omit<Signal, "id"|"status"> & { status?: Signal["status"] }) {
  const { rows } = await pool.query(
    `insert into public.signals
     (user_id, project_id, capture_id, title, summary, truth_chain, cohorts, strategic_moves, evidence, confidence, why_this_surfaced, source, origin, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,coalesce($14,'unreviewed'))
     returning *`,
    [
      s.user_id, s.project_id ?? null, s.capture_id ?? null, s.title, s.summary,
      s.truth_chain, s.cohorts ?? [], s.strategic_moves ?? [], s.evidence ?? [],
      s.confidence ?? null, s.why_this_surfaced ?? null, s.source, s.origin, s.status ?? "unreviewed"
    ]
  );
  return rows[0];
}