import { Pool } from "pg";

export async function ensureAnalysisSchema(pool: Pool) {
  await pool.query(`
    create table if not exists analysis_jobs (
      id uuid primary key default gen_random_uuid(),
      target_type text not null check (target_type in ('capture','group')),
      target_id uuid not null,
      status text not null default 'pending',  -- pending|running|complete|error
      attempts int not null default 0,
      error text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists idx_analysis_jobs_status on analysis_jobs(status, created_at);

    alter table if exists truth_checks
      add column if not exists result jsonb,
      add column if not exists started_at timestamptz,
      add column if not exists completed_at timestamptz,
      add column if not exists error text;

    -- evidence payload for flexible storage
    alter table if exists truth_evidence
      add column if not exists payload jsonb;
  `);
}