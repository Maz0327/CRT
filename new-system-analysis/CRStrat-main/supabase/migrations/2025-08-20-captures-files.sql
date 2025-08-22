-- Part 5: add file metadata columns to captures
ALTER TABLE public.captures
  ADD COLUMN IF NOT EXISTS file_path     text,
  ADD COLUMN IF NOT EXISTS file_type     text,
  ADD COLUMN IF NOT EXISTS file_size     bigint,
  ADD COLUMN IF NOT EXISTS content_hash  text,
  ADD COLUMN IF NOT EXISTS notes         text;

CREATE INDEX IF NOT EXISTS captures_content_hash_idx ON public.captures (content_hash);
CREATE INDEX IF NOT EXISTS captures_project_id_idx   ON public.captures (project_id);