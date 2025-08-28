// Truth Lab Golden Set runner
// - Hits the live API endpoint (same process)
// - Verifies multi-sentence, minimum-length, no-vague-filler outputs

import fs from "node:fs/promises";
import path from "node:path";

type Fixture = { title: string; text: string };

const API = process.env.API_URL || "http://localhost:5001";
const PROJECT_ID = process.env.PROJECT_ID || "test-project"; // any valid project in your dev db
const ENDPOINTS = [
  "/api/truth/analyze-text",
  "/api/truth/analyze",               // fallback if your route differs
  "/api/truth/extract-and-analyze"    // last resort
];

const MIN = {
  fact: 80,
  observation: 120,
  insight: 140,
  human_truth: 140,
  cultural_moment: 140
};

const BANNED_PHRASES = [
  "as an ai",
  "cannot provide",
  "insufficient context",
  "i am unable",
  "as a language model"
];

function hasBanned(s: string) {
  const lc = s.toLowerCase();
  return BANNED_PHRASES.some(b => lc.includes(b));
}
function sentenceCount(s: string) {
  return (s.match(/[.!?]\s/g) || []).length + (/[.!?]$/.test(s) ? 1 : 0);
}

async function pickEndpoint(): Promise<string> {
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(API + ep, {
        method: "OPTIONS"
      });
      if (res.ok || res.status === 405) return ep; // 405 = method not allowed (still exists)
    } catch {}
  }
  // If OPTIONS probing doesn't work, try a trivial POST to detect a 4xx/5xx vs ECONNREFUSED
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(API + ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "ping", projectId: PROJECT_ID, mode: "quick" })
      });
      if (res.status !== 404 && res.status !== 400) return ep;
    } catch {}
  }
  throw new Error("No Truth Lab analyze endpoint found. Expected one of: " + ENDPOINTS.join(", "));
}

function coerceChain(payload: any) {
  // Accept either flat keys or nested { truth_chain: {...} }
  const chain = payload?.truth_chain ?? payload ?? {};
  return {
    fact: String(chain.fact || ""),
    observation: String(chain.observation || ""),
    insight: String(chain.insight || ""),
    human_truth: String(chain.human_truth || ""),
    cultural_moment: String(chain.cultural_moment || "")
  };
}

async function runCase(fixturePath: string, endpoint: string) {
  const raw = await fs.readFile(fixturePath, "utf-8");
  const fx: Fixture = JSON.parse(raw);

  const res = await fetch(API + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: fx.text, projectId: PROJECT_ID, mode: "deep" })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} on ${endpoint} for ${path.basename(fixturePath)} :: ${body}`);
  }

  const json = await res.json();
  const chain = coerceChain(json);

  const failures: string[] = [];
  for (const [key, min] of Object.entries(MIN)) {
    const val = (chain as any)[key] as string;
    if (!val || val.trim().length < min) {
      failures.push(`${key} too short (${val?.trim().length || 0} < ${min})`);
    }
    if (sentenceCount(val) < 2) {
      failures.push(`${key} must be multi-sentence`);
    }
    if (hasBanned(val)) {
      failures.push(`${key} contains banned filler phrase`);
    }
  }

  return {
    name: path.basename(fixturePath),
    ok: failures.length === 0,
    failures
  };
}

async function main() {
  const fixturesDir = path.resolve("scripts/golden/truthlab/fixtures");
  const files = (await fs.readdir(fixturesDir))
    .filter(f => f.endsWith(".json"))
    .map(f => path.join(fixturesDir, f));

  if (files.length === 0) {
    console.error("No fixtures found.");
    process.exit(2);
  }

  // Probe endpoint
  const endpoint = await pickEndpoint();

  const results = [];
  for (const f of files) {
    try {
      results.push(await runCase(f, endpoint));
    } catch (err: any) {
      results.push({ name: path.basename(f), ok: false, failures: [err?.message || String(err)] });
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;

  for (const r of results) {
    if (r.ok) {
      console.log(`✅ ${r.name}`);
    } else {
      console.log(`❌ ${r.name}`);
      for (const msg of r.failures) console.log(`   - ${msg}`);
    }
  }
  console.log(`\nGolden set: ${passed} passed, ${failed} failed`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});