import fs from "fs";
import os from "os";
import { execSync } from "child_process";

type Check = { name: string; ok: boolean; details?: string };

const BASE =
  process.env.APP_BASE_URL ||
  process.env.APP_URL ||
  "http://localhost:5000";

const requiredEnv = [
  "NODE_ENV",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_JWT_SECRET",
  "SUPABASE_STORAGE_BUCKET",
  "MEDIA_PROVIDER",
  "ENABLE_WORKERS",
];

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MOCK_UUID = "550e8400-e29b-41d4-a716-446655440000";
const MOCK_EMAIL = "user@example.com";

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const txt = await res.text();
  try {
    return { status: res.status, json: JSON.parse(txt) };
  } catch {
    return { status: res.status, json: null, raw: txt };
  }
}

async function main() {
  const checks: Check[] = [];

  // 1) Env sanity
  try {
    const missing = requiredEnv.filter((k) => !process.env[k]);
    const prod = process.env.NODE_ENV === "production";
    const viteMock = process.env.MOCK_AUTH ?? "(not set in server env)";
    checks.push({
      name: "ENV: required vars present",
      ok: missing.length === 0,
      details: missing.length ? `missing: ${missing.join(", ")}` : "ok",
    });
    checks.push({
      name: "ENV: NODE_ENV=production",
      ok: prod,
      details: `NODE_ENV=${process.env.NODE_ENV}`,
    });
    checks.push({
      name: "ENV: client mock flag (compile-time) visible to server env",
      ok: viteMock === "0" || viteMock === "(not set in server env)",
      details: `MOCK_AUTH=${viteMock}`,
    });
  } catch (e: any) {
    checks.push({ name: "ENV checks", ok: false, details: e?.message });
  }

  // 2) Google creds file exists (if path set)
  try {
    const gpath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const hasB64 = !!process.env.GCP_SA_KEY_JSON_B64;
    const ok =
      (gpath ? fs.existsSync(gpath) : false) ||
      hasB64; // bootstrap writes /tmp/gcp-sa.json at runtime
    checks.push({
      name: "Google creds: available",
      ok,
      details: gpath
        ? `${gpath} exists=${gpath ? fs.existsSync(gpath) : false}`
        : hasB64
        ? "will bootstrap from GCP_SA_KEY_JSON_B64"
        : "no path and no B64",
    });
  } catch (e: any) {
    checks.push({ name: "Google creds: available", ok: false, details: e?.message });
  }

  // 3) /healthz
  try {
    const { status, json } = await fetchJson(`${BASE}/healthz`);
    const env = json?.environment;
    checks.push({
      name: "Healthz: reachable & production",
      ok: status === 200 && env === "production",
      details: `status=${status}, env=${env}`,
    });
  } catch (e: any) {
    checks.push({ name: "Healthz", ok: false, details: e?.message });
  }

  // 4) /readyz
  try {
    const { status, json } = await fetchJson(`${BASE}/readyz`);
    const ready = json?.status === "ready";
    const db = json?.checks?.database === "pass";
    const workers = json?.checks?.workers === "healthy";
    checks.push({
      name: "Readyz: db & workers",
      ok: status === 200 && ready && db && workers,
      details: `status=${status}, ready=${ready}, db=${db}, workers=${workers}`,
    });
  } catch (e: any) {
    checks.push({ name: "Readyz", ok: false, details: e?.message });
  }

  // 5) Auth live (not mock)
  try {
    const token = process.env.SB_TEST_TOKEN;
    if (!token) {
      checks.push({
        name: "Auth: SB_TEST_TOKEN present",
        ok: false,
        details: "SB_TEST_TOKEN missing",
      });
    } else {
      const { status, json } = await fetchJson(`${BASE}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const id = json?.id;
      const email = json?.email;
      const looksReal =
        id && uuidRe.test(id) && id !== MOCK_UUID && email && email !== MOCK_EMAIL;
      checks.push({
        name: "Auth: /api/auth/user real",
        ok: status === 200 && looksReal,
        details: `status=${status}, id=${id}, email=${email}`,
      });
    }
  } catch (e: any) {
    checks.push({ name: "Auth live", ok: false, details: e?.message });
  }

  // 6) Supabase live (quick truth_checks count)
  try {
    const { status, json } = await fetchJson(`${BASE}/api/truth/sample-count`, {
      // optional: if you have a simple count route; otherwise skip
      headers: { Authorization: `Bearer ${process.env.SB_TEST_TOKEN ?? ""}` },
    });
    if (status === 200 && typeof json?.count === "number") {
      checks.push({
        name: "Supabase: live (truth_checks count)",
        ok: true,
        details: `rows=${json.count}`,
      });
    } else {
      // fallback: call integrations test script via child process
      const out = execSync(
        "NODE_ENV=production npx tsx server/test-integrations.ts",
        { stdio: "pipe" }
      ).toString();
      const live = out.includes("✅ Supabase: Live");
      checks.push({
        name: "Supabase: live (fallback script)",
        ok: live,
        details: out.split(os.EOL).slice(0, 6).join(" | "),
      });
    }
  } catch (e: any) {
    checks.push({ name: "Supabase live", ok: false, details: e?.message });
  }

  // 7) Google Vision live (via test script)
  try {
    const out = execSync(
      "NODE_ENV=production npx tsx server/scripts/test-vision.ts",
      { stdio: "pipe" }
    ).toString();
    const ok = /Labels?:\s*\[/.test(out) || /Vision ok/i.test(out);
    checks.push({
      name: "Google Vision: live",
      ok,
      details: ok ? "labels detected" : out.slice(0, 200),
    });
  } catch (e: any) {
    checks.push({
      name: "Google Vision: live",
      ok: false,
      details: (e as Error).message,
    });
  }

  // 8) OpenAI live (via integrations script)
  try {
    const out = execSync(
      "NODE_ENV=production npx tsx server/test-integrations.ts",
      { stdio: "pipe" }
    ).toString();
    const ok = out.includes("✅ OpenAI: Live");
    checks.push({
      name: "OpenAI: live",
      ok,
      details: ok ? "pong" : out.slice(0, 200),
    });
  } catch (e: any) {
    checks.push({ name: "OpenAI: live", ok: false, details: (e as Error).message });
  }

  // Print summary
  const pass = checks.filter((c) => c.ok).length;
  const fail = checks.length - pass;

  console.log("=== Verify Live (No-Mock) Summary ===");
  for (const c of checks) {
    console.log(`${c.ok ? "✅" : "❌"} ${c.name} — ${c.details ?? ""}`);
  }
  console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);

  // Non-zero exit if any fail
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Verifier crashed:", e);
  process.exit(1);
});