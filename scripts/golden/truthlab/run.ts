// Truth Lab Golden Set runner
// - Tests truth analysis pipeline directly (bypasses HTTP)
// - Verifies multi-sentence, minimum-length, no-vague-filler outputs

import fs from "node:fs/promises";
import path from "node:path";

type Fixture = { title: string; text: string };

const MIN = {
  fact: 50,
  observation: 70,
  insight: 70,
  human_truth: 60,
  cultural_moment: 70
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

function coerceChain(payload: any) {
  // Accept either flat keys or nested { result: { truth_chain: {...} } } or { truth_chain: {...} }
  const chain = payload?.result?.truth_chain ?? payload?.truth_chain ?? payload ?? {};
  return {
    fact: String(chain.fact || ""),
    observation: String(chain.observation || ""),
    insight: String(chain.insight || ""),
    human_truth: String(chain.human_truth || ""),
    cultural_moment: String(chain.cultural_moment || "")
  };
}

async function runCase(fixturePath: string) {
  const raw = await fs.readFile(fixturePath, "utf-8");
  const fx: Fixture = JSON.parse(raw);

  try {
    // Import the truth analysis pipeline directly
    const { analyzeTruthBundle } = await import("../../../server/services/truth/pipeline");
    
    // Call the function directly with mock user data (use proper UUID format)
    const result = await analyzeTruthBundle({
      userId: "00000000-0000-0000-0000-000000000001",
      projectId: "00000000-0000-0000-0000-000000000002",
      input: { text: fx.text, title: fx.title }
    });

    if ((result as any).error) {
      throw new Error(`Pipeline error: ${(result as any).error}`);
    }

    // Debug: Log the actual result structure (uncomment for debugging)
    // console.log(`Debug - Raw result for ${path.basename(fixturePath)}:`, JSON.stringify(result, null, 2));

    const chain = coerceChain(result);

    const failures: string[] = [];
    for (const [key, min] of Object.entries(MIN)) {
      const val = (chain as any)[key] as string;
      if (!val || val.trim().length < min) {
        failures.push(`${key} too short (${val?.trim().length || 0} < ${min})`);
      }
      if (sentenceCount(val) < 1) {
        failures.push(`${key} must have at least one sentence`);
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
  } catch (err: any) {
    return {
      name: path.basename(fixturePath),
      ok: false,
      failures: [err?.message || String(err)]
    };
  }
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

  console.log("✅ Running Truth Lab Golden Set (direct pipeline test)");

  const results = [];
  for (const f of files) {
    try {
      results.push(await runCase(f));
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