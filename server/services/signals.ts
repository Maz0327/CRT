import { many, one } from "../lib/db";
import type { SignalCreateInput, SignalRecord, SignalStatus, TruthChain } from "../types/signals";

function unpackTruth(t?: TruthChain) {
  return {
    fact: t?.fact ?? null,
    observation: t?.observation ?? null,
    insight: t?.insight ?? null,
    human_truth: t?.human_truth ?? null,
    cultural_moment: t?.cultural_moment ?? null,
  };
}

export async function createSignal(userId: string, input: SignalCreateInput): Promise<SignalRecord> {
  if (!input.projectId) throw new Error("projectId required");
  if (!input.title || input.title.length > 120) throw new Error("title required (<=120 chars)");
  if (!input.summary || input.summary.length > 800) throw new Error("summary required (<=800 chars)");
  const truth = unpackTruth(input.truth_chain);

  const row = await one<SignalRecord>(
    `
    insert into public.signals (
      project_id, created_by, source_capture_ids, truth_check_id,
      title, summary,
      truth_fact, truth_observation, truth_insight, truth_human_truth, truth_cultural_moment,
      strategic_moves, cohorts, receipts, confidence, why_surfaced, status, origin, source_tag
    )
    values (
      $1, $2, coalesce($3,'{}'::text[]), $4,
      $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13, coalesce($14,'[]'::jsonb), $15, $16, 'unreviewed', $17, $18
    )
    returning *
    `,
    [
      input.projectId,
      userId,
      input.source_capture_ids ?? null,
      input.truth_check_id ?? null,
      input.title,
      input.summary,
      truth.fact,
      truth.observation,
      truth.insight,
      truth.human_truth,
      truth.cultural_moment,
      input.strategic_moves ?? null,
      input.cohorts ?? null,
      input.receipts ?? null,
      input.confidence ?? null,
      input.why_surfaced ?? null,
      input.origin ?? "analysis",
      input.source_tag ?? null,
    ]
  );
  return row;
}

export async function confirmSignal(userId: string, signalId: string): Promise<SignalRecord> {
  const row = await one<SignalRecord>(
    `update public.signals set status='confirmed' where id=$1 returning *`,
    [signalId]
  );
  await one(
    `insert into public.signal_feedback (signal_id, user_id, action) values ($1,$2,'confirm') returning id`,
    [signalId, userId]
  );
  return row;
}

export async function needsEditSignal(userId: string, signalId: string, notes?: string): Promise<SignalRecord> {
  const row = await one<SignalRecord>(
    `update public.signals set status='needs_edit' where id=$1 returning *`,
    [signalId]
  );
  await one(
    `insert into public.signal_feedback (signal_id, user_id, action, notes) values ($1,$2,'needs_edit',$3) returning id`,
    [signalId, userId, notes ?? null]
  );
  return row;
}

export async function listSignals(_userId: string, projectId: string, status?: SignalStatus): Promise<SignalRecord[]> {
  if (!projectId) throw new Error("projectId required");
  if (status) {
    return many<SignalRecord>(
      `select * from public.signals where project_id=$1 and status=$2 order by updated_at desc limit 200`,
      [projectId, status]
    );
  }
  return many<SignalRecord>(
    `select * from public.signals where project_id=$1 order by updated_at desc limit 200`,
    [projectId]
  );
}