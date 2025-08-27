// server/lib/db/projects.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export type Project = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

// NOTE: adjust table/column names if your schema differs.
// Assumes a projects table with (id uuid pk, name text, owner_id uuid, created_at, updated_at)
// and a membership/ACL model where owner_id implies access.

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const q = `
    select id, name, owner_id, created_at, updated_at
    from projects
    where owner_id = $1
    order by updated_at desc nulls last, created_at desc
  `;
  const { rows } = await pool.query(q, [userId]);
  return rows as Project[];
}

export async function userHasAccessToProject(userId: string, projectId: string): Promise<boolean> {
  const q = `
    select 1
    from projects
    where id = $1 and owner_id = $2
    limit 1
  `;
  const { rowCount } = await pool.query(q, [projectId, userId]);
  return rowCount === 1;
}

export async function createProject(userId: string, name: string): Promise<Project> {
  const q = `
    insert into projects (name, owner_id)
    values ($1, $2)
    returning id, name, owner_id, created_at, updated_at
  `;
  const { rows } = await pool.query(q, [name, userId]);
  return rows[0] as Project;
}

export async function firstOwnedOrRecentProjectId(userId: string): Promise<string | null> {
  const q = `
    select id
    from projects
    where owner_id = $1
    order by updated_at desc nulls last, created_at desc
    limit 1
  `;
  const { rows } = await pool.query(q, [userId]);
  return rows[0]?.id ?? null;
}