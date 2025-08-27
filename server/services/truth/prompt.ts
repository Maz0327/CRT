export function truthSystemPrompt() {
  return [
    "You are a senior cultural strategist.",
    "Transform messy inputs (posts, screenshots, threads) into a clean, evidence-backed Truth Chain.",
    "No fluff. No generic advice. Every claim must be tied to receipts.",
    "Use direct quotes sparingly and always include source+timestamp when available.",
    "Return strictly valid JSON following the provided schema.",
  ].join(" ");
}

export function truthUserPrompt({
  title,
  mergedText,
  sourceHints,
}: {
  title?: string;
  mergedText: string;
  sourceHints?: string[];
}) {
  const schema = {
    title: "max 80-char headline",
    summary: "2-line summary of what & why",
    truth_chain: {
      fact: "",
      observation: "",
      insight: "",
      human_truth: "",
      cultural_moment: "",
    },
    cohorts: ["array of succinct audience cohort names"],
    strategic_moves: ["specific actions"],
    evidence: [
      { quote: "", url: "", timestamp: "", source: "" }
    ],
    confidence: 0.0,
    why_this_surfaced: "one clear sentence tied to prior behavior or project",
  };

  return [
    title ? `Title: ${title}` : "",
    "Inputs below (may contain multiple posts/screenshots/links stitched together with separators):",
    "----- BEGIN INPUT -----",
    mergedText,
    "----- END INPUT -----",
    sourceHints && sourceHints.length ? `Sources: ${sourceHints.join(", ")}` : "",
    "Return JSON only with the exact keys:",
    JSON.stringify(schema, null, 2),
  ].filter(Boolean).join("\n\n");
}