-- Add slides jsonb to dsd_briefs if not present
alter table if exists public.dsd_briefs
  add column if not exists slides jsonb default '[]'::jsonb;

-- Ensure tags arrays exist with correct type on captures/moments/briefs
alter table if exists public.captures
  alter column tags type text[] using (
    case when tags is null then array[]::text[]
         when jsonb_typeof(to_jsonb(tags)) = 'array' then
           (select array_agg(elem::text) from jsonb_array_elements_text(to_jsonb(tags)) elem)
         else array[]::text[] end
  ),
  alter column tags set default array[]::text[];

alter table if exists public.cultural_moments
  alter column tags type text[] using (
    case when tags is null then array[]::text[]
         when jsonb_typeof(to_jsonb(tags)) = 'array' then
           (select array_agg(elem::text) from jsonb_array_elements_text(to_jsonb(tags)) elem)
         else array[]::text[] end
  ),
  alter column tags set default array[]::text[];

alter table if exists public.dsd_briefs
  add column if not exists tags text[] default array[]::text[];

-- Simple GIN indexes for tag filters
create index if not exists idx_captures_tags on public.captures using gin (tags);
create index if not exists idx_moments_tags on public.cultural_moments using gin (tags);
create index if not exists idx_briefs_tags on public.dsd_briefs using gin (tags);

-- Touch updated_at on update
drop trigger if exists trg_dsd_briefs_touch_updated_at on public.dsd_briefs;
create trigger trg_dsd_briefs_touch_updated_at
before update on public.dsd_briefs
for each row execute function public.touch_updated_at();