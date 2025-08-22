-- Part 6: Truth Lab core tables (non-breaking)
create extension if not exists pgcrypto;

create table if not exists public.truth_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid null,
  content_hash text null,

  source_type text not null check (source_type in ('url','text','image')),
  source_url text null,
  source_text text null,
  source_image_path text null,

  extracted_text text null,
  extracted_images jsonb null,

  result_truth jsonb null,
  result_strategic jsonb null,
  result_cohorts jsonb null,
  result_visual jsonb null,

  status text not null default 'pending' check (status in
    ('pending','extracting','ready_for_text','text_running','ready_for_visual','visual_running','done','error')),
  error text null,

  created_at timestamptz not null default now()
);

create table if not exists public.truth_evidence (
  id uuid primary key default gen_random_uuid(),
  truth_check_id uuid references public.truth_checks(id) on delete cascade,
  kind text not null, -- 'dom' | 'ocr' | 'logo' | 'note'
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  truth_check_id uuid references public.truth_checks(id) on delete cascade,
  job_type text not null check (job_type in ('extract','text.quick','text.deep','visual.quick','visual.deep')),
  status text not null default 'pending' check (status in ('pending','running','succeeded','failed')),
  progress integer not null default 0,
  error text null,
  created_at timestamptz not null default now()
);

create index if not exists truth_checks_user_id_idx on public.truth_checks(user_id);
create index if not exists truth_checks_project_id_idx on public.truth_checks(project_id);
-- create index if not exists truth_checks_content_hash_idx on public.truth_checks(content_hash);
create index if not exists analysis_jobs_truth_idx on public.analysis_jobs(truth_check_id);

alter table public.truth_checks enable row level security;
alter table public.truth_evidence enable row level security;
alter table public.analysis_jobs enable row level security;

-- RLS: user owns their truth checks (project RLS handled elsewhere)
do $$
begin
  if not exists (select 1 from pg_policies where policyname='truth_checks_owner') then
    create policy truth_checks_owner on public.truth_checks
      for all using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='truth_evidence_owner') then
    create policy truth_evidence_owner on public.truth_evidence
      for all using (exists (select 1 from public.truth_checks t where t.id = truth_check_id and t.user_id = auth.uid()))
      with check (exists (select 1 from public.truth_checks t where t.id = truth_check_id and t.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='analysis_jobs_owner') then
    create policy analysis_jobs_owner on public.analysis_jobs
      for all using (exists (select 1 from public.truth_checks t where t.id = truth_check_id and t.user_id = auth.uid()))
      with check (exists (select 1 from public.truth_checks t where t.id = truth_check_id and t.user_id = auth.uid()));
  end if;
end$$;