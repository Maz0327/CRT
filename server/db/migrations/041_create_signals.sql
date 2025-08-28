-- 041_create_signals.sql
-- Signals are canonical, presentation-ready analysis units produced by Truth Lab.

-- Extensions (on Supabase these are typically already enabled)
-- create extension if not exists "pgcrypto";         -- for gen_random_uuid()
-- create extension if not exists "uuid-ossp";

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,
  project_id uuid null references public.projects(id) on delete set null,
  capture_id uuid null references public.captures(id) on delete set null,

  title text not null,
  summary text not null,

  truth_chain jsonb not null,               -- { fact, observation, insight, human_truth, cultural_moment }
  cohorts text[] not null default '{}',     -- ["Gen-Z beauty dupers", ...]
  strategic_moves text[] not null default '{}',
  evidence jsonb[] not null default '{}',   -- [{quote, url, timestamp, source}]
  confidence numeric null check (confidence >= 0 and confidence <= 1),
  why_this_surfaced text null,

  source text not null default 'upload'
    check (source in ('upload','extension','feed','manual','api','other')),
  origin text not null default 'web',

  status text not null default 'unreviewed'
    check (status in ('unreviewed','confirmed','needs_edit')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_signals_project_id on public.signals(project_id);
create index if not exists idx_signals_user_id on public.signals(user_id);
create index if not exists idx_signals_status on public.signals(status);
create index if not exists idx_signals_created_at on public.signals(created_at desc);

-- RLS (we keep API as the gate, but set sane defaults)
alter table public.signals enable row level security;

-- Allow users to see and manage their own signals (only if auth schema exists)
do $$
begin
  -- Check if auth schema exists (Supabase)
  if exists (select 1 from information_schema.schemata where schema_name = 'auth') then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='signals' and policyname='signals_select_own') then
      create policy signals_select_own on public.signals
        for select using (user_id = auth.uid());
    end if;

    if not exists (select 1 from pg_policies where schemaname='public' and tablename='signals' and policyname='signals_insert_own') then
      create policy signals_insert_own on public.signals
        for insert with check (user_id = auth.uid());
    end if;

    if not exists (select 1 from pg_policies where schemaname='public' and tablename='signals' and policyname='signals_update_own') then
      create policy signals_update_own on public.signals
        for update using (user_id = auth.uid());
    end if;
  end if;
end$$;

-- Touch trigger to auto-update updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'signals_touch_updated_at'
  ) then
    create trigger signals_touch_updated_at
      before update on public.signals
      for each row execute function public.touch_updated_at();
  end if;
end$$;

-- Record the migration
create table if not exists public.schema_migrations (id text primary key, applied_at timestamptz not null default now());
insert into public.schema_migrations(id) values ('041_create_signals') on conflict do nothing;