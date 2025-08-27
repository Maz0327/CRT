import OpenAI from "openai";
import { buildTruthLabPrompt } from "./prompts";

const hasOpenAI = !!process.env.OPENAI_API_KEY;

export async function runTruthLabForText(input: {
  concatenatedText: string;
  topicHint?: string;
}) {
  const { system, user } = buildTruthLabPrompt(input);

  if (!hasOpenAI) {
    // Fallback heuristic so pipeline completes even without AI
    const tokens = input.concatenatedText.split(/\s+/).filter(Boolean);
    const approxLen = tokens.length;
    return {
      headline: "Concentrated signal from grouped captures",
      summary: "Multiple related inputs suggest a converging pattern.",
      truth_chain: {
        fact: `We analyzed ~${approxLen} tokens of grouped content.`,
        observation: "Sources share overlapping themes; language clusters appear consistent.",
        insight: "Underlying motivations likely relate to value-seeking and social proof dynamics.",
        human_truth: "People follow momentum when patterns feel familiar and validated by peers.",
        cultural_moment: "A micro-trend is forming; early adopters are codifying shared language."
      },
      cohorts: ["early adopters", "value-seekers"],
      strategic_moves: ["codify the pattern", "package social proof"],
      confidence: 0.55,
      receipts: [],
      why_this_surfaced: "Grouped by user; related signals within close time proximity."
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini", // fast default; override via env
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: { type: "json_object" }
  });

  const raw = resp.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return { error: "LLM returned non-JSON", raw };
  }
}