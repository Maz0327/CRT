/**
 * Golden test for Truth Lab via in-process Express app (no localhost sockets).
 * It uses createApp({ testMode: true }) so we can inject a test user and project id.
 */

import { createApp } from "../../server/app";
import request from "supertest";

type Chain = {
  fact?: string;
  observation?: string;
  insight?: string;
  human_truth?: string;
  cultural_moment?: string;
};
type AnalyzeResponse = {
  ok?: boolean;
  signalId?: string;
  truth_chain?: Chain;
  error?: string;
};

const PROJECT_ID = process.env.TEST_PROJECT_ID || "test-project";
const app = createApp({ testMode: true });

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

function paragraphsReady(chain: Chain): string[] {
  const errs: string[] = [];
  const min = { fact: 80, observation: 120, insight: 140, human_truth: 140, cultural_moment: 140 };

  (Object.keys(min) as (keyof Chain)[]).forEach((k) => {
    const v = (chain[k] || "").trim();
    if (!v) errs.push(`${k}: missing`);
    else {
      if (v.length < (min[k] as number)) errs.push(`${k}: too short (${v.length} chars)`);
      if (!/[.!?]\s/.test(v)) errs.push(`${k}: likely single sentence`);
    }
  });
  return errs;
}

async function main() {
  // 1) Call the text analyze endpoint in-process via supertest
  const res = await request(app)
    .post("/api/truth/analyze-text")
    .set("Content-Type", "application/json")
    .set("X-Project-ID", PROJECT_ID)
    .send({ 
      text: GOLDEN_TEXT,
      mode: "quick",          // keep latency low for CI; "deep" later if desired
      options: { temperature: 0.2 }
    });

  const body = res.body as AnalyzeResponse;

  if (res.status !== 200) {
    console.error("❌ HTTP status:", res.status);
    console.error("Body:", body);
    process.exit(1);
  }

  if (!body.ok) {
    console.error("❌ API error:", body.error || "not ok");
    process.exit(1);
  }

  if (!body.signalId) {
    console.error("❌ signalId missing in response");
    process.exit(1);
  }

  // 3) shape checks
  const tc = body?.truth_chain || {};
  if (typeof tc.fact !== "string") {
    console.error("❌ Missing 'fact'");
    process.exit(1);
  }
  if (typeof tc.observation !== "string") {
    console.error("❌ Missing 'observation'");
    process.exit(1);
  }
  if (typeof tc.insight !== "string") {
    console.error("❌ Missing 'insight'");
    process.exit(1);
  }
  if (typeof tc.human_truth !== "string") {
    console.error("❌ Missing 'human_truth'");
    process.exit(1);
  }
  if (typeof tc.cultural_moment !== "string") {
    console.error("❌ Missing 'cultural_moment'");
    process.exit(1);
  }

  // 4) narrative quality checks (Jobs-style: no vagueness, real narrative)
  (["fact","observation","insight","human_truth","cultural_moment"] as const).forEach((k) => {
    const text = String(tc[k] || "");
    if (text.length < MIN_CHARS[k]) {
      console.error(`❌ ${k} too short (${text.length} chars, need ${MIN_CHARS[k]})`);
      process.exit(1);
    }
    if (!hasEnoughSentences(text, MIN_SENTENCES[k])) {
      console.error(`❌ ${k} needs ${MIN_SENTENCES[k]}+ sentences`);
      process.exit(1);
    }
    if (isTooVague(text)) {
      console.error(`❌ ${k} is vague/banned`);
      process.exit(1);
    }
  });

  // Optional extras if present
  if (Array.isArray(body?.strategic_moves)) {
    if (body.strategic_moves.length === 0) {
      console.error("❌ strategic_moves should not be empty when present");
      process.exit(1);
    }
  }
  if (Array.isArray(body?.cohorts)) {
    if (body.cohorts.length === 0) {
      console.error("❌ cohorts should not be empty when present");
      process.exit(1);
    }
  }

  console.log("✅ Truth Lab in-process golden passed");
  console.log(JSON.stringify({ signalId: body.signalId, status: "ok" }, null, 2));
}

main().catch((e) => {
  console.error("❌ Uncaught test error:", e);
  process.exit(1);
});