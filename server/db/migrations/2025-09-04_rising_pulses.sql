-- Rising Pulses table migration
-- Creates table for Rising Pulses feature (replaces Emerging Themes)

create table if not exists public.rising_pulses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  term text not null,
  rationale text,
  receipts jsonb default '[]', -- [{quote,url,source,timestamp}]
  confidence numeric check (confidence >= 0 and confidence <= 1),
  surfaced_at timestamptz not null default now()
);

create index if not exists idx_rising_pulses_project on public.rising_pulses(project_id);
create index if not exists idx_rising_pulses_term on public.rising_pulses(term);
create index if not exists idx_rising_pulses_surfaced_at on public.rising_pulses(surfaced_at desc);

-- Add RLS policy for multi-tenant access
alter table public.rising_pulses enable row level security;

create policy "Users can view rising pulses from their projects" on public.rising_pulses
  for select using (
    project_id in (
      select id from public.projects 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert rising pulses to their projects" on public.rising_pulses
  for insert with check (
    project_id in (
      select id from public.projects 
      where user_id = auth.uid()
    )
  );

create policy "Users can update rising pulses in their projects" on public.rising_pulses
  for update using (
    project_id in (
      select id from public.projects 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete rising pulses from their projects" on public.rising_pulses
  for delete using (
    project_id in (
      select id from public.projects 
      where user_id = auth.uid()
    )
  );