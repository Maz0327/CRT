-- Truth Lab A1 – schema extension (idempotent)

-- required enum(s)
do $$ begin
  create type truth_source_type as enum ('url','text','image');
exception when duplicate_object then null; end $$;

do $$ begin
  create type truth_status as enum ('pending','extracting','ready_for_text','text_running','ready_for_visual','visual_running','done','error');
exception when duplicate_object then null; end $$;

-- main table (create if missing; else alter)
create table if not exists truth_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid null,
  source_type truth_source_type not null,
  source_url text null,
  source_text text null,
  source_image_path text null,

  extracted_text text null,
  extracted_images jsonb null, -- [{url|path,width,height,hash}]

  result_truth jsonb null,      -- 5-layer (FACT, OBSERVATION, INSIGHT, HUMAN_TRUTH, CULTURAL_MOMENT)
  result_strategic jsonb null,  -- Strategic Focus + Competitive Intelligence
  result_cohorts jsonb null,    -- array of cohorts
  result_visual jsonb null,     -- image analysis

  status truth_status not null default 'pending',
  error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_truth_checks_user on truth_checks(user_id);
create index if not exists idx_truth_checks_project on truth_checks(project_id);
create index if not exists idx_truth_checks_status on truth_checks(status);

-- RLS
alter table truth_checks enable row level security;

do $$ begin
  create policy truth_isolation on truth_checks
    for all using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- trigger for updated_at
do $$ begin
  create or replace function set_updated_at() returns trigger as $$
  begin new.updated_at = now(); return new; end $$ language plpgsql;
  create trigger trg_truth_updated_at
    before update on truth_checks
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;