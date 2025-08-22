-- CAPTURES: add file metadata + notes
ALTER TABLE public.captures
  ADD COLUMN IF NOT EXISTS file_key text,
  ADD COLUMN IF NOT EXISTS file_mime text,
  ADD COLUMN IF NOT EXISTS file_bytes bigint,
  ADD COLUMN IF NOT EXISTS file_pages int,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE INDEX IF NOT EXISTS idx_captures_project_created ON public.captures(project_id, created_at DESC);

-- TRUTH CHECKS: create if missing
CREATE TABLE IF NOT EXISTS public.truth_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NULL,
  capture_id uuid NULL,
  kind text NOT NULL CHECK (kind IN ('url','text','image')),
  input_url text NULL,
  input_text text NULL,
  input_file_key text NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','done','error')),
  verdict text NULL,         -- e.g. likely_true, misleading, likely_false, unverified
  confidence numeric NULL,   -- 0..1
  summary jsonb NULL,        -- structured result
  error text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_truth_checks_user_created ON public.truth_checks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_truth_checks_project_created ON public.truth_checks(project_id, created_at DESC);

-- EVIDENCE: optional supporting data
CREATE TABLE IF NOT EXISTS public.truth_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truth_id uuid NOT NULL REFERENCES public.truth_checks(id) ON DELETE CASCADE,
  title text,
  source_url text,
  snippet text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS (owner-based, align with existing policy style)
ALTER TABLE public.truth_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS truth_checks_owner_select ON public.truth_checks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS truth_checks_owner_mod ON public.truth_checks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.truth_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS truth_evidence_owner_select ON public.truth_evidence
  FOR SELECT USING (truth_id IN (SELECT id FROM public.truth_checks WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS truth_evidence_owner_mod ON public.truth_evidence
  FOR ALL USING (truth_id IN (SELECT id FROM public.truth_checks WHERE user_id = auth.uid()));