import { readFileSync, readdirSync } from "fs";
import path from "path";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        id text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const dir = path.resolve(__dirname, "migrations");
    const files = readdirSync(dir)
      .filter(f => /^\d+_.*\.sql$/.test(f))
      .sort();

    for (const f of files) {
      const id = f.replace(/\.sql$/, "");
      const { rows } = await client.query("select 1 from public.schema_migrations where id = $1", [id]);
      if (rows.length) {
        continue; // already applied
      }
      const sql = readFileSync(path.join(dir, f), "utf8");
      console.log(`Applying migration ${id} ...`);
      await client.query(sql);
      console.log(`Applied ${id}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});