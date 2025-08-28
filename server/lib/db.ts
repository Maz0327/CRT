import { Pool } from "pg";

const ssl =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false as const }
    : false;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

// Helper for single-row SELECT/INSERT ... RETURNING *
export async function one<T = any>(text: string, params: any[] = []): Promise<T> {
  const res = await pool.query<T>(text, params as any);
  if (res.rows.length === 0) throw new Error("Not found");
  return res.rows[0] as T;
}

export async function many<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const res = await pool.query<T>(text, params as any);
  return res.rows as T[];
}