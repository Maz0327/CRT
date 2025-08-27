import { pg } from "../../lib/pg";

export type EvidenceItem = {
  quote?: string;
  url?: string;
  source?: string;
  timestamp?: string; // keep flexible
};

export type SaveTruthCheckArgs = {
  userId: string;
  projectId?: string | null;
  title?: string;
  inputText?: string;
  inputUrls?: string[];
  inputImages?: string[];
  result: any;        // JSON from the model
  confidence?: number;
  status?: string;    // 'complete' | 'error' | ...
};

export async function saveTruthCheck(args: SaveTruthCheckArgs) {
  const {
    userId,
    projectId = null,
    title,
    inputText,
    inputUrls,
    inputImages,
    result,
    confidence = result?.confidence ?? null,
    status = "complete",
  } = args;

  const q = `
    insert into public.truth_checks
      (user_id, project_id, title, input_text, input_urls, input_images, result, confidence, status)
    values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning id
  `;
  const { rows } = await pg.query(q, [
    userId,
    projectId,
    title ?? null,
    inputText ?? null,
    inputUrls ?? null,
    inputImages ?? null,
    result ?? {},
    confidence,
    status,
  ]);
  return rows[0].id as string;
}

export async function saveEvidence(truthCheckId: string, evidence: EvidenceItem[]) {
  if (!evidence?.length) return;
  const q = `
    insert into public.truth_evidence
      (truth_check_id, quote, url, source, event_timestamp)
    values
      ($1, $2, $3, $4, $5)
  `;
  for (const e of evidence) {
    await pg.query(q, [
      truthCheckId,
      e.quote ?? null,
      e.url ?? null,
      e.source ?? null,
      e.timestamp ?? null,
    ]);
  }
}

export async function getTruthCheckById(id: string) {
  const checkQ = `select * from public.truth_checks where id = $1`;
  const evQ = `select * from public.truth_evidence where truth_check_id = $1 order by created_at asc`;
  const [check, ev] = await Promise.all([
    pg.query(checkQ, [id]),
    pg.query(evQ, [id]),
  ]);
  if (!check.rows[0]) return null;
  return { check: check.rows[0], evidence: ev.rows };
}