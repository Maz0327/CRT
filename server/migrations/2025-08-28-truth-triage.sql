-- Add triage fields to truth_checks
DO $$ BEGIN
  ALTER TABLE public.truth_checks
    ADD COLUMN IF NOT EXISTS model_confidence numeric(3,2) CHECK (model_confidence >= 0 AND model_confidence <= 1),
    ADD COLUMN IF NOT EXISTS triage_label text CHECK (triage_label IN ('none','needs_review','in_review','resolved')) DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS triage_reasons text[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

-- Helpful index for triage filtering per project
CREATE INDEX IF NOT EXISTS idx_truth_checks_triage
  ON public.truth_checks (project_id, triage_label, created_at DESC);