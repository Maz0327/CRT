import assert from "node:assert";
import { getSupabaseAccessToken } from "../auth/getToken";

const API = process.env.API_URL || "http://172.31.102.130:5001";

/**
 * Golden content: realistic, multi-sentence input so our narrative checks
 * (Fact/Observation/Insight/Human Truth/Cultural Moment) have enough signal.
 */
const GOLDEN_TEXT = `
Short-form video creators on YouTube Shorts and TikTok are driving a surge in "dupe economy" content:
side-by-side comparisons, thrift flips, and "save vs. splurge" breakdowns.
Audiences celebrate finding smart alternatives and share them as social currency.
Brands that acknowledge value seeking—without shaming the audience—earn disproportionate engagement.
`;

const MIN_SENTENCES = {
  fact: 2,
  observation: 2,
  insight: 2,
  human_truth: 2,
  cultural_moment: 2,
};

const MIN_CHARS = {
  fact: 80,
  observation: 120,
  insight: 140,
  human_truth: 140,
  cultural_moment: 140,
};

const BANNED_PHRASES = [
  "as an ai",
  "cannot",
  "might be",
  "possibly",
  "unclear",
  "i'm just",
  "as a language model",
];

function hasEnoughSentences(s: string, min: number) {
  const sentences = s.replace(/\s+/g, " ").split(/[.!?]\s/).filter(Boolean);
  return sentences.length >= min;
}
function isTooVague(s: string) {
  const lower = s.toLowerCase();
  return BANNED_PHRASES.some(p => lower.includes(p));
}

async function main() {
  // 1) login to Supabase to get a real JWT
  const token = await getSupabaseAccessToken({
    email: process.env.TEST_EMAIL || "test@example.com",
    password: process.env.TEST_PASSWORD || "test123",
  });

  // 2) call Truth Lab HTTP endpoint with JWT
  const res = await fetch(API + "/api/truth/analyze-text", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      // Project scoping header (adjust if your middleware expects a different name):
      "X-Project-ID": process.env.TEST_PROJECT_ID || "00000000-0000-0000-0000-000000000001",
    },
    body: JSON.stringify({
      text: GOLDEN_TEXT,
      mode: "quick",          // keep latency low for CI; "deep" later if desired
      options: { temperature: 0.2 }
    }),
  });

  const body = await res.json().catch(() => ({} as any));
  console.log("HTTP", res.status);
  if (res.status !== 200) {
    console.error("Response:", body);
    throw new Error("Truth API failed with status " + res.status);
  }

  // 3) shape checks
  const tc = body?.truth_chain || {};
  assert(typeof tc.fact === "string", "Missing 'fact'");
  assert(typeof tc.observation === "string", "Missing 'observation'");
  assert(typeof tc.insight === "string", "Missing 'insight'");
  assert(typeof tc.human_truth === "string", "Missing 'human_truth'");
  assert(typeof tc.cultural_moment === "string", "Missing 'cultural_moment'");

  // 4) narrative quality checks (Jobs-style: no vagueness, real narrative)
  (["fact","observation","insight","human_truth","cultural_moment"] as const).forEach((k) => {
    const text = String(tc[k] || "");
    assert(text.length >= MIN_CHARS[k], `${k} too short`);
    assert(hasEnoughSentences(text, MIN_SENTENCES[k]), `${k} needs ${MIN_SENTENCES[k]}+ sentences`);
    assert(!isTooVague(text), `${k} is vague/banned`);
  });

  // Optional extras if present
  if (Array.isArray(body?.strategic_moves)) {
    assert(body.strategic_moves.length > 0, "strategic_moves should not be empty when present");
  }
  if (Array.isArray(body?.cohorts)) {
    assert(body.cohorts.length > 0, "cohorts should not be empty when present");
  }

  console.log("✅ Truth Lab HTTP golden passed.");
}
main().catch(err => { console.error(err); process.exit(1); });