-- truth review fields on truth_checks
DO $$ BEGIN
  ALTER TABLE public.truth_checks
    ADD COLUMN IF NOT EXISTS review_status text CHECK (review_status IN ('unreviewed','confirmed','needs_edit')) DEFAULT 'unreviewed',
    ADD COLUMN IF NOT EXISTS review_note text,
    ADD COLUMN IF NOT EXISTS reviewed_by uuid,
    ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
EXCEPTION WHEN duplicate_column THEN
  -- ignore if already present
  NULL;
END $$;

-- Optional index to filter triage queues fast
CREATE INDEX IF NOT EXISTS idx_truth_checks_project_status_created
  ON public.truth_checks (project_id, review_status, created_at DESC);