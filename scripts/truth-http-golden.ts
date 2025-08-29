/**
 * Golden test for Truth Lab via in-process Express app (no localhost sockets).
 * It uses createApp({ testMode: true }) so we can inject a test user and project id.
 */

import { createApp } from "../server/app";
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
  chain?: Chain;
  error?: string;
};

const PROJECT_ID = process.env.TEST_PROJECT_ID || "test-project";
const app = createApp({ testMode: true });

// Basic narrative validators (same thresholds we agreed)
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
  // 1) Call the text analyze endpoint in-process
  const sample =
    "NYC bodegas are putting QR codes on the counter that link to their TikTok accounts—" +
    "racking up millions of views on snack taste tests and late-night customer interviews.";

  const res = await request(app)
    .post("/api/truth/analyze-text")
    .set("Content-Type", "application/json")
    .set("X-Project-ID", PROJECT_ID)
    .send({ projectId: PROJECT_ID, content: sample });

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

  const chain = body.chain || {};
  const errs = paragraphsReady(chain);
  if (errs.length) {
    console.error("❌ Narrative quality checks failed:\n - " + errs.join("\n - "));
    process.exit(1);
  }

  console.log("✅ Truth Lab in-process golden passed");
  console.log(JSON.stringify({ signalId: body.signalId, status: "ok" }, null, 2));
}

main().catch((e) => {
  console.error("❌ Uncaught test error:", e);
  process.exit(1);
});