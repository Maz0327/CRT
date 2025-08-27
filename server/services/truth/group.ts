import { Pool } from "pg";
import { runTruthLabForText } from "./runner";

type CaptureRow = {
  id: string;
  url?: string;
  title?: string;
  text?: string;
  ocr_text?: string;
  content?: any;
};

function rowToSnippet(r: CaptureRow) {
  const parts: string[] = [];
  if (r.title) parts.push(`TITLE: ${r.title}`);
  if (r.url) parts.push(`URL: ${r.url}`);
  const text = r.text || r.ocr_text || (typeof r.content === "string" ? r.content : "");
  if (text) parts.push(`TEXT: ${text}`);
  return parts.join("\n").trim();
}

export async function analyzeGroup(pool: Pool, groupId: string, opts?: { topicHint?: string }) {
  // 1) Get items in order
  const { rows: items } = await pool.query(
    `select cgi.capture_id
       from capture_group_items cgi
      where cgi.group_id = $1
      order by cgi.position asc, cgi.added_at asc`,
    [groupId]
  );

  // 2) Fetch capture rows (best-effort columns; schema tolerant)
  const captureIds = items.map(r => r.capture_id);
  let concatenatedText = "";
  if (captureIds.length) {
    const { rows: caps } = await pool.query(`
      select id,
             coalesce(url, '') as url,
             coalesce(title, '') as title,
             case when exists(select 1)
                  then coalesce(text, '') end as text,
             case when exists(select 1)
                  then coalesce(ocr_text, '') end as ocr_text,
             case when exists(select 1)
                  then content end as content
        from captures
       where id = any($1::uuid[])
    `, [captureIds]);
    concatenatedText = caps.map(rowToSnippet).join("\n\n---\n\n");
  }

  // 3) Run Truth Lab (AI or heuristic)
  const result = await runTruthLabForText({
    concatenatedText: concatenatedText || "No textual content available.",
    topicHint: opts?.topicHint
  });

  // 4) Persist into truth_checks (one row per group run)
  const { rows: [check] } = await pool.query(
    `insert into truth_checks (group_id, status, started_at, result, created_at)
         values ($1, 'complete', now(), $2::jsonb, now())
      returning id`,
    [groupId, JSON.stringify(result)]
  );

  // 5) Optional: store an evidence snapshot row
  await pool.query(
    `insert into truth_evidence (group_id, payload)
         values ($1, $2::jsonb)`,
    [groupId, JSON.stringify({ captureIds, concatenatedPreview: (concatenatedText || "").slice(0, 4000) })]
  );

  return { checkId: check.id, result };
}