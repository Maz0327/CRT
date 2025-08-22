-- Migration: Create view for latest analysis per capture (Task Block #6)
-- Date: 2025-08-14
-- Description: Fast read-model exposing the most recent analysis per capture

-- Fast read-model exposing the most recent analysis per capture
CREATE OR REPLACE VIEW public.capture_latest_analysis AS
SELECT DISTINCT ON (ca.capture_id)
  ca.capture_id,
  ca.id AS analysis_id,
  ca.provider,
  ca.mode,
  ca.status,
  ca.summary,
  ca.labels,
  ca.created_at AS analyzed_at
FROM public.capture_analyses ca
ORDER BY ca.capture_id, ca.created_at DESC;

-- Helpful index if not already present
CREATE INDEX IF NOT EXISTS idx_ca_by_capture_created
  ON public.capture_analyses(capture_id, created_at DESC);

-- Grant access to the view
GRANT SELECT ON public.capture_latest_analysis TO authenticated;
GRANT SELECT ON public.capture_latest_analysis TO service_role;