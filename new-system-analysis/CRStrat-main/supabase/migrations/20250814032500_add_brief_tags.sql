-- add tags to dsd_briefs if missing
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'dsd_briefs'
      and column_name = 'tags'
  ) then
    alter table public.dsd_briefs
      add column tags text[] not null default '{}'::text[];
  end if;
end $$;

-- helpful indexes
create index if not exists idx_captures_tags on public.captures using gin (tags);
create index if not exists idx_briefs_tags on public.dsd_briefs using gin (tags);

-- ensure updated_at trigger exists (harmless if already there)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists trg_dsd_briefs_touch_updated_at on public.dsd_briefs;
create trigger trg_dsd_briefs_touch_updated_at
before update on public.dsd_briefs
for each row execute function public.touch_updated_at();