import type { RequestEvidence } from './types';
import OpenAI from 'openai';

const MODEL_TEXT_QUICK = process.env.MODEL_TEXT_QUICK || 'gpt-4o-mini';
const MODEL_TEXT_FALLBACK = process.env.MODEL_TEXT_FALLBACK || 'gpt-4o-mini';

// PAC-aligned, JSON-only schema for the 5-layer + strategic + cohorts (quick = skeleton)
export async function runQuickTextAnalysis(evidence: RequestEvidence) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildQuickPrompt(evidence);
  try {
    const resp = await client.chat.completions.create({
      model: MODEL_TEXT_QUICK,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemGuardrails() },
        { role: 'user', content: prompt }
      ],
    });
    const json = safeParse(resp.choices?.[0]?.message?.content);
    // Expect minimal skeleton fields; normalize shape below
    return normalizeQuick(json);
  } catch (e) {
    // fallback once
    if (MODEL_TEXT_QUICK !== MODEL_TEXT_FALLBACK) {
      const resp = await client.chat.completions.create({
        model: MODEL_TEXT_FALLBACK,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemGuardrails() },
          { role: 'user', content: prompt }
        ],
      });
      const json = safeParse(resp.choices?.[0]?.message?.content);
      return normalizeQuick(json);
    }
    throw e;
  }
}

function systemGuardrails() {
  return `You are a strategic analyst. Produce STRICT JSON only.
Ground claims in provided EVIDENCE. Align with a PAC lens (Platforms & Culture).
If uncertain, mark fields succinctly but do not hallucinate.`;
}

function buildQuickPrompt(ev: RequestEvidence) {
  return `EVIDENCE:
TEXT:
${ev.text?.slice(0, 8000) || ''}

TASK:
Return a compact JSON with:
{
  "result_truth": {
    "fact": ["..."],
    "observation": ["..."],
    "insight": ["..."],
    "human_truth": ["..."],
    "cultural_moment": ["..."]
  },
  "result_strategic": {
    "strategic_focus": ["..."],
    "competitive_intelligence": ["..."]
  },
  "result_cohorts": [{
    "name":"...", "description":"...",
    "behaviorPatterns":["..."], "platforms":["..."],
    "size":"small|medium|large", "engagement":"low|medium|high"
  }]
}
Keep lists brief (1-2 bullets per field).`;
}

function safeParse(s?: string | null) { try { return s ? JSON.parse(s) : {}; } catch { return {}; } }
function normalizeQuick(j: any) {
  return {
    result_truth: j?.result_truth ?? {},
    result_strategic: j?.result_strategic ?? {},
    result_cohorts: Array.isArray(j?.result_cohorts) ? j.result_cohorts : [],
  };
}

// Minimal type
export type QuickTextOutput = ReturnType<typeof normalizeQuick>;