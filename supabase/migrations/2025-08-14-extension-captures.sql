-- 1) Extra capture fields for screenshots + analysis state
alter table public.captures
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists image_url text,
  add column if not exists image_thumb_url text,
  add column if not exists selection_rect jsonb,
  add column if not exists ocr_text text,
  add column if not exists source_author text,
  add column if not exists source_posted_at timestamptz,
  add column if not exists source_metrics jsonb,
  add column if not exists analysis_status text check (analysis_status in ('pending','complete','failed')) default null,
  add column if not exists analysis_run_id text;

-- 2) Make tags efficient (already text[]); add GIN index for tag filtering
create index if not exists idx_captures_tags_gin on public.captures using gin (tags);

-- 3) Token table for Chrome extension (user-scoped, hash stored)
create table if not exists public.extension_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked boolean not null default false
);
alter table public.extension_tokens enable row level security;

drop policy if exists ext_tok_select on public.extension_tokens;
drop policy if exists ext_tok_all on public.extension_tokens;

create policy ext_tok_select on public.extension_tokens
  for select
  using (auth.uid() = user_id);

create policy ext_tok_all on public.extension_tokens
  for all
  using (auth.uid() = user_id);

-- 4) Lightweight job table for Truth Analysis handoff
create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid not null references public.captures(id) on delete cascade,
  status text not null check (status in ('queued','running','complete','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.analysis_jobs enable row level security;

drop policy if exists analysis_jobs_owner on public.analysis_jobs;
create policy analysis_jobs_owner on public.analysis_jobs
  for select
  using (exists (
    select 1 from public.captures c 
    where c.id = analysis_jobs.capture_id and c.user_id = auth.uid()
  ));

-- 5) Storage bucket: create if missing (via SQL)
insert into storage.buckets (id, name, public)
select 'captures', 'captures', false
where not exists (select 1 from storage.buckets where id='captures');