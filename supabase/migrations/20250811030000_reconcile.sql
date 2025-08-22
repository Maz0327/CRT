-- Migration to reconcile schema with specification
-- Generated on 2025-08-11 03:00:00

-- First, create or replace the touch_updated_at function
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Fix users table
alter table public.users 
  alter column created_at set not null,
  alter column updated_at set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

-- Recreate captures table with correct schema
drop table if exists public.captures_new;
create table public.captures_new (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  platform text,
  url text,
  tags text[],
  viral_score integer,
  ai_analysis jsonb,
  dsd_tags text[],
  dsd_section text,
  predicted_virality numeric,
  actual_virality numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate data from old captures table
insert into public.captures_new (
  id, user_id, title, content, platform, url, 
  viral_score, dsd_section, predicted_virality,
  created_at, updated_at
)
select 
  id, 
  user_id,
  coalesce(title, 'Untitled'),
  coalesce(content, 'No content'),
  platform,
  url,
  viral_score,
  dsd_section,
  viral_potential,
  coalesce(created_at, now()),
  coalesce(updated_at, now())
from public.captures
where user_id is not null;

-- Replace old captures table
drop table public.captures;
alter table public.captures_new rename to captures;

-- Recreate cultural_moments table with correct schema
drop table if exists public.cultural_moments_new;
create table public.cultural_moments_new (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null,
  intensity integer not null,
  platforms text[],
  demographics text[],
  duration text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate data from old cultural_moments table
insert into public.cultural_moments_new (
  id, title, description, intensity, created_at, updated_at
)
select 
  id,
  coalesce(moment_type, 'Untitled Moment'),
  coalesce(description, 'No description'),
  5, -- default intensity
  coalesce(created_at, now()),
  now()
from public.cultural_moments;

-- Replace old cultural_moments table
drop table public.cultural_moments;
alter table public.cultural_moments_new rename to cultural_moments;

-- Recreate dsd_briefs table with correct schema
drop table if exists public.dsd_briefs_new;
create table public.dsd_briefs_new (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_profile_id uuid,
  title text not null,
  status text,
  define_section jsonb,
  shift_section jsonb,
  deliver_section jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate data from old dsd_briefs table (need to add user_id from somewhere)
-- For now, we'll use the first available user
with first_user as (
  select id from public.users limit 1
)
insert into public.dsd_briefs_new (
  id, user_id, title, status, define_section, shift_section, deliver_section,
  created_at, updated_at
)
select 
  d.id,
  u.id,
  d.title,
  d.status,
  d.define_content,
  d.shift_content,
  d.deliver_content,
  coalesce(d.created_at, now()),
  coalesce(d.updated_at, now())
from public.dsd_briefs d
cross join first_user u;

-- Replace old dsd_briefs table
drop table public.dsd_briefs;
alter table public.dsd_briefs_new rename to dsd_briefs;

-- Create updated_at triggers for all tables
do $$
begin
  -- Drop existing triggers if they exist
  drop trigger if exists touch_users_updated_at on public.users;
  drop trigger if exists touch_captures_updated_at on public.captures;
  drop trigger if exists touch_cultural_moments_updated_at on public.cultural_moments;
  drop trigger if exists touch_dsd_briefs_updated_at on public.dsd_briefs;
  
  -- Create new triggers
  create trigger touch_users_updated_at before update on public.users
    for each row execute function public.touch_updated_at();
    
  create trigger touch_captures_updated_at before update on public.captures
    for each row execute function public.touch_updated_at();
    
  create trigger touch_cultural_moments_updated_at before update on public.cultural_moments
    for each row execute function public.touch_updated_at();
    
  create trigger touch_dsd_briefs_updated_at before update on public.dsd_briefs
    for each row execute function public.touch_updated_at();
end $$;