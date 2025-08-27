-- Enable uuid if needed
create extension if not exists "pgcrypto";

-- TRUTH CHECKS
create table if not exists public.truth_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid,
  title text,
  input_text text,
  input_urls text[],
  input_images text[],
  result jsonb not null,
  confidence numeric,
  status text not null default 'complete',
  created_at timestamptz not null default now()
);

-- TRUTH EVIDENCE
create table if not exists public.truth_evidence (
  id uuid primary key default gen_random_uuid(),
  truth_check_id uuid not null references public.truth_checks(id) on delete cascade,
  quote text,
  url text,
  source text,
  event_timestamp text, -- keep as text; sources vary (ISO/string)
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_truth_checks_user on public.truth_checks(user_id);
create index if not exists idx_truth_checks_project on public.truth_checks(project_id);
create index if not exists idx_truth_checks_created on public.truth_checks(created_at desc);
create index if not exists idx_truth_evidence_check on public.truth_evidence(truth_check_id);