-- signals: canonical strategic units
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  created_by uuid not null,
  source_capture_ids text[] default '{}',           -- original capture ids
  truth_check_id uuid,                               -- optional link to last truth run
  title text not null,
  summary text not null,
  truth_fact text,
  truth_observation text,
  truth_insight text,
  truth_human_truth text,
  truth_cultural_moment text,
  strategic_moves text[],                            -- <= 3
  cohorts text[],                                    -- persona labels
  receipts jsonb default '[]',                       -- [{quote,url,timestamp,source}]
  receipts_count int generated always as (jsonb_array_length(coalesce(receipts,'[]'::jsonb))) stored,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  why_surfaced text,
  status text not null default 'unreviewed',         -- unreviewed | confirmed | needs_edit
  origin text default 'analysis',                    -- extension | upload | feed | analysis
  source_tag text,                                   -- e.g. 'Upload', 'Reddit', 'YouTube'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- signal_feedback: human loop signals
create table if not exists public.signal_feedback (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  user_id uuid not null,
  action text not null,                              -- confirm | needs_edit
  clarity_score int,                                 -- optional 1..5 (future)
  proof_strength int,                                -- optional 1..5 (future)
  relevance int,                                     -- optional 1..5 (future)
  notes text,
  created_at timestamptz not null default now()
);

-- helpful indexes
create index if not exists idx_signals_project on public.signals(project_id);
create index if not exists idx_signals_status on public.signals(status);
create index if not exists idx_signal_feedback_signal on public.signal_feedback(signal_id);

-- tiny trigger to keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_signals_touch on public.signals;
create trigger trg_signals_touch
before update on public.signals
for each row
execute function public.touch_updated_at();