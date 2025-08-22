-- Enable uuid function if not already available
create extension if not exists pgcrypto;

-- 8A: Moments tables + materialized view
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  tags text[] default '{}'::text[],
  intensity numeric default 0,                -- normalized 0..100
  evidence jsonb default '[]'::jsonb,         -- [{capture_id, at, weight}]
  "window" text default '24h',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_moments_project_id on public.moments(project_id);
create index if not exists idx_moments_intensity on public.moments(intensity desc);
create index if not exists idx_moments_tags on public.moments using gin (tags);

-- Materialized view for fast read of last 24h
create materialized view if not exists public.moments_read_24h as
select
  md5(coalesce(string_agg(t::text, ',' order by t::text), 'none'))::uuid as id,
  c.project_id,
  coalesce(array_remove(array_agg(distinct t), null), '{}') as tags,
  count(*)::numeric as cnt,
  least(100, (count(*)::numeric * 4)) as intensity,
  jsonb_agg(jsonb_build_object('capture_id', c.id, 'at', c.created_at) order by c.created_at desc) as evidence,
  '24h'::text as "window",
  min(c.created_at) as created_at,
  now() as updated_at,
  coalesce(nullif(trim(regexp_replace(array_to_string(array_agg(distinct t), ', '), '\s+', ' ', 'g')), ''), 'Emerging Pattern') as title,
  null::text as description
from public.captures c
left join lateral (
  select unnest(coalesce(c.tags, '{}')) as t
  union all
  select jsonb_array_elements_text(coalesce((
    select labels from public.capture_latest_analysis cla
    where cla.capture_id = c.id
  ), '[]'::jsonb))
) tag on true
where c.created_at >= now() - interval '24 hours'
group by c.project_id;

create index if not exists idx_moments_read_24h_project on public.moments_read_24h(project_id);
create index if not exists idx_moments_read_24h_intensity on public.moments_read_24h(intensity desc);

-- RLS for curated moments table (API also enforces ownership)
alter table public.moments enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'moments' and policyname = 'Owner can manage') then
    create policy "Owner can manage" on public.moments
      for all using (
        exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
      )
      with check (
        exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
      );
  end if;
end$$;

-- Touch trigger
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists trg_moments_touch on public.moments;
create trigger trg_moments_touch before update on public.moments
for each row execute function public.touch_updated_at();

-- 8B: Extension tokens (hashed, scoped)
create table if not exists public.ext_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid,
  label text,
  token_hash text not null,
  scope text[] default '{capture:create}'::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ext_tokens_user on public.ext_tokens(user_id);
create index if not exists idx_ext_tokens_project on public.ext_tokens(project_id);