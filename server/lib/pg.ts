import { Pool } from "pg";
const ssl =
  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;

export const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl as any,
});