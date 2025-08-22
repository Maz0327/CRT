import { supabaseAdmin } from '../lib/supabaseAdmin';
import { getMediaProvider } from '../services/analysis';
import { AnalysisResultSchema } from '../services/analysis/schema';

export async function processNextJob() {
  const db = supabaseAdmin;

  // claim one job
  const { data: jobs, error } = await db
    .from('media_analysis_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error || !jobs || jobs.length === 0) return false;
  const job = jobs[0];

  await db.from('media_analysis_jobs').update({ status: 'running' }).eq('id', job.id);

  const provider = getMediaProvider();
  try {
    const started = Date.now();
    const result = await provider.analyze({
      sourcePath: job.source_path!,
      kind: 'image',               // TODO: extend to 'video' when we add frame sampling
      mode: job.mode,
      userId: job.user_id
    });
    const validated = AnalysisResultSchema.parse(result);

    await db.from('media_analysis_results').insert({
      job_id: job.id,
      summary: validated.summary ?? '',
      shots: validated.shots ?? [],
      labels: validated.labels ?? [],
      ocr: validated.ocr ?? [],
      asr: validated.asr ?? [],
      meta: { ...(validated.meta || {}), duration_ms: Date.now() - started }
    });

    // optional auto-tagging: derive tags from labels and write to captures/brief_assets
    if ((process.env.AUTO_TAG_FROM_ANALYSIS || '').toLowerCase() === 'true' && job.capture_id) {
      const tags = (validated.labels || []).map(l => l.name).slice(0, 20);
      try {
        await db.rpc('merge_capture_tags', { capture_id_input: job.capture_id, new_tags: tags });
      } catch {
        // If merge_capture_tags function doesn't exist, skip silently.
      }
    }

    await db.from('media_analysis_jobs').update({ status: 'succeeded' }).eq('id', job.id);
  } catch (e: any) {
    await db.from('media_analysis_jobs').update({ status: 'failed', error: String(e?.message || e) }).eq('id', job.id);
  }
  return true;
}

export function startMediaWorker() {
  if ((process.env.ENABLE_WORKERS || '').toLowerCase() !== 'true') return;
  setInterval(() => { processNextJob().catch(() => {}); }, 3000);
}