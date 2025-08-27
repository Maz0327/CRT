import { Pool } from "pg";

export async function ensureCaptureGroupsSchema(pool: Pool) {
  // create tables if missing
  await pool.query(`
    create table if not exists capture_groups (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null,
      user_id uuid not null,
      name text not null,
      status text not null default 'draft', -- draft|analyzing|complete|error
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table if not exists capture_group_items (
      group_id uuid not null,
      capture_id uuid not null,
      position int not null default 0,
      added_at timestamptz not null default now(),
      primary key (group_id, capture_id)
    );
    -- link items to group and capture tables if they exist
    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='captures') and
         not exists (select 1 from information_schema.table_constraints where constraint_name='capture_group_items_capture_fk') then
        alter table capture_group_items
        add constraint capture_group_items_capture_fk
        foreign key (capture_id) references captures(id) on delete cascade;
      end if;
    end $$;

    -- soft FKs to projects/users if present
    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='projects') and
         not exists (select 1 from information_schema.table_constraints where constraint_name='capture_groups_project_fk') then
        alter table capture_groups
        add constraint capture_groups_project_fk
        foreign key (project_id) references projects(id) on delete set null;
      end if;
    end $$;

    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='users') and
         not exists (select 1 from information_schema.table_constraints where constraint_name='capture_groups_user_fk') then
        alter table capture_groups
        add constraint capture_groups_user_fk
        foreign key (user_id) references users(id) on delete set null;
      end if;
    end $$;

    -- add group_id to truth tables if missing
    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='truth_checks') then
        alter table truth_checks add column if not exists group_id uuid;
      end if;
    end $$;

    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='truth_evidence') then
        alter table truth_evidence add column if not exists group_id uuid;
      end if;
    end $$;

    -- index for fast lookups
    create index if not exists idx_capture_group_items_group on capture_group_items(group_id);
    
    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='truth_checks') then
        create index if not exists idx_truth_checks_group on truth_checks(group_id);
      end if;
    end $$;

    do $$
    begin
      if exists (select 1 from information_schema.tables where table_name='truth_evidence') then
        create index if not exists idx_truth_evidence_group on truth_evidence(group_id);
      end if;
    end $$;
  `);
}