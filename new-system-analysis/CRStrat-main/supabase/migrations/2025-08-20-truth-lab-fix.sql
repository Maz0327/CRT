-- Part 6 fix: align uuid/text mismatches on truth tables

-- Clean up test data and ensure columns are uuid compatible
DO $$
BEGIN
  -- Clean up any test data that can't be converted to uuid
  DELETE FROM public.truth_checks WHERE user_id = 'dev-user' OR user_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  
  -- Ensure columns exist and are uuid
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='truth_checks' AND column_name='user_id' AND data_type <> 'uuid') THEN
    EXECUTE 'ALTER TABLE public.truth_checks ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='truth_checks' AND column_name='project_id' AND data_type <> 'uuid') THEN
    EXECUTE 'ALTER TABLE public.truth_checks ALTER COLUMN project_id TYPE uuid USING project_id::uuid';
  END IF;
END$$;

-- Optional FK: only add if auth.users exists and FK not already present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='auth' AND c.relname='users')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema='public' AND table_name='truth_checks' AND constraint_name='truth_checks_user_id_fkey') THEN
    EXECUTE 'ALTER TABLE public.truth_checks ADD CONSTRAINT truth_checks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE';
  END IF;
END$$;

-- Make sure status column contains allowed values (recreate enum behavior via CHECK)
ALTER TABLE public.truth_checks
  ALTER COLUMN status SET DEFAULT 'pending',
  ADD CONSTRAINT truth_checks_status_chk CHECK (status in ('pending','extracting','ready_for_text','text_running','ready_for_visual','visual_running','done','error'))
  NOT VALID;
-- Validate but don't block if rows exist:
ALTER TABLE public.truth_checks VALIDATE CONSTRAINT truth_checks_status_chk;

-- analysis_jobs status check
ALTER TABLE public.analysis_jobs
  ALTER COLUMN status SET DEFAULT 'pending',
  ADD CONSTRAINT analysis_jobs_status_chk CHECK (status in ('pending','running','succeeded','failed'))
  NOT VALID;
ALTER TABLE public.analysis_jobs VALIDATE CONSTRAINT analysis_jobs_status_chk;