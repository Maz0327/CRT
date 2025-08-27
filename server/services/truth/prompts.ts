export function buildTruthLabPrompt(input: {
  topicHint?: string;
  concatenatedText: string;
}) {
  const { topicHint, concatenatedText } = input;

  // System + developer framing for narrative, specificity, and receipts
  const system = [
    "You are a senior strategy analyst. Produce rigorous, non-generic analysis.",
    "Use the Truth Chain: Fact → Observation → Insight → Human Truth → Cultural Moment.",
    "Be concise but substantial: 2–4 sentences per layer (no single-sentence cop-outs).",
    "Add a one-sentence headline that reads like a front-page cultural insight.",
    "Cite up to 5 short receipts (quoted snippets) with minimal source details when possible."
  ].join(" ");

  const user = [
    topicHint ? `Topic hint: ${topicHint}` : null,
    "Analyze the following concatenated sources (screens, posts, transcripts).",
    "Return strict JSON matching this schema:",
    `{
      "headline": "string",
      "summary": "2 lines max",
      "truth_chain": {
        "fact": "2–4 sentences",
        "observation": "2–4 sentences",
        "insight": "2–4 sentences",
        "human_truth": "2–4 sentences",
        "cultural_moment": "2–4 sentences"
      },
      "cohorts": ["short labels"],
      "strategic_moves": ["short imperatives"],
      "confidence": 0.0,
      "receipts": [{"quote":"string","source":"string"}],
      "why_this_surfaced": "1–2 sentences, reference prior usage if known"
    }`,
    "",
    "==== BEGIN CONTENT ====",
    concatenatedText.slice(0, 18000), // safety guard
    "==== END CONTENT ===="
  ].filter(Boolean).join("\n");

  return { system, user };
}