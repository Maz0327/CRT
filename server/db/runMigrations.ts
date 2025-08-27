import fs from "fs";
import path from "path";
import { Pool } from "pg";

const ssl =
  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl as any,
});

export async function runTruthLabMigration() {
  const file = path.resolve(
    __dirname,
    "migrations",
    "2025-08-27-truth-lab.sql"
  );
  const sql = fs.readFileSync(file, "utf8");
  await pool.query(sql);
}