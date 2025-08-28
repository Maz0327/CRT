import { Pool } from "pg";
import { contentHash } from "../lib/contentHash";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false });

type TruthChain = {
  fact?: string;
  observation?: string;
  insight?: string;
  human_truth?: string;
  cultural_moment?: string;
};

type PromoteArgs = {
  projectId: string;
  createdBy: string;
  sourceCaptureIds?: string[];
  truthCheckId?: string | null;
  title: string;
  summary: string;
  truth_chain: TruthChain;
  strategic_moves?: string[];
  cohorts?: string[];
  receipts?: Array<{ quote?: string; url?: string; timestamp?: string; source?: string }>;
  confidence?: number;
  why_surfaced?: string;
  origin?: string;         // 'extension' | 'upload' | 'feed' | 'analysis'
  source_tag?: string;     // e.g. 'Upload', 'Reddit', ...
  dedupeDays?: number;     // default 14
};

export async function promoteTruthToSignal(args: PromoteArgs): Promise<{ signalId: string; created: boolean }> {
  const {
    projectId,
    createdBy,
    sourceCaptureIds = [],
    truthCheckId = null,
    title,
    summary,
    truth_chain,
    strategic_moves = [],
    cohorts = [],
    receipts = [],
    confidence,
    why_surfaced,
    origin = "analysis",
    source_tag,
    dedupeDays = 14,
  } = args;

  // 1) Create a stable content hash from the most important narrative fields
  const hash = contentHash([
    projectId,
    title,
    summary,
    truth_chain.fact,
    truth_chain.observation,
    truth_chain.insight,
    truth_chain.human_truth,
    truth_chain.cultural_moment,
  ]);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 2) Try to find a recent signal in same project with same hash (soft dedupe)
    const existing = await client.query(
      `
      select id
      from public.signals
      where project_id = $1
        and substring(encode(digest($2, 'sha256'),'hex') for 64) is not null -- force planner to realize hash input
        and updated_at > (now() - ($3 || ' days')::interval)
        and content_hash = $4
      order by updated_at desc
      limit 1
      `,
      [projectId, hash, dedupeDays, hash]
    ).catch(async (e) => {
      // Backfill column if not present (defensive)
      if (/column .* content_hash .* does not exist/i.test(String(e))) {
        await client.query(`alter table public.signals add column if not exists content_hash text`);
        return client.query(
          `
          select id
          from public.signals
          where project_id = $1
            and updated_at > (now() - ($2 || ' days')::interval)
            and content_hash = $3
          order by updated_at desc
          limit 1
          `,
          [projectId, dedupeDays, hash]
        );
      }
      throw e;
    });

    if (existing?.rows?.[0]?.id) {
      const signalId = existing.rows[0].id as string;

      // Merge receipts & capture IDs (set union), bump updated_at and why_surfaced if provided
      await client.query(
        `
        update public.signals
        set
          source_capture_ids = (
            select array(select distinct unnest(coalesce(source_capture_ids,'{}'::text[]) || $2::text[]))
          ),
          receipts = coalesce(receipts, '[]'::jsonb) || $3::jsonb,
          updated_at = now(),
          truth_check_id = coalesce($4, truth_check_id),
          confidence = coalesce($5, confidence),
          why_surfaced = coalesce($6, why_surfaced)
        where id = $1
        `,
        [signalId, sourceCaptureIds, JSON.stringify(receipts || []), truthCheckId, confidence ?? null, why_surfaced ?? null]
      );

      await client.query("COMMIT");
      return { signalId, created: false };
    }

    // 3) Create a new signal
    const res = await client.query(
      `
      insert into public.signals (
        project_id, created_by, source_capture_ids, truth_check_id,
        title, summary,
        truth_fact, truth_observation, truth_insight, truth_human_truth, truth_cultural_moment,
        strategic_moves, cohorts, receipts, confidence, why_surfaced,
        origin, source_tag, status, content_hash
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'unreviewed',$19)
      returning id
      `,
      [
        projectId, createdBy, sourceCaptureIds, truthCheckId,
        title, summary,
        truth_chain.fact ?? null,
        truth_chain.observation ?? null,
        truth_chain.insight ?? null,
        truth_chain.human_truth ?? null,
        truth_chain.cultural_moment ?? null,
        strategic_moves, cohorts, JSON.stringify(receipts || []),
        confidence ?? null, why_surfaced ?? null,
        origin, source_tag, hash,
      ]
    );

    const signalId = res.rows[0].id as string;
    await client.query("COMMIT");
    return { signalId, created: true };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}