import { chatJSON } from "../ai/openai";
import { truthSystemPrompt, truthUserPrompt } from "./prompt";
import { extractFromUrl, ocrImagePlaceholder } from "./extract";
import { saveTruthCheck, saveEvidence, updateTriageFields } from "./store";
import { computeTriage } from "./triage";

const MODEL_STRICT = process.env.TRUTH_LAB_MODEL || "gpt-4o-mini"; // changeable by env

export type BundleInput = {
  title?: string;
  text?: string;                // direct user-provided text
  urls?: string[];              // web pages to extract text from
  imageUrls?: string[];         // screenshots (OCR later)
  captureSnippets?: string[];   // already-stored text from captures
};

export async function analyzeTruthBundle({
  userId,
  projectId,
  input,
}: {
  userId: string;
  projectId?: string | null;
  input: BundleInput;
}) {
  // 1) Gather text
  const parts: string[] = [];
  if (input.text) parts.push(input.text);

  if (input.urls?.length) {
    for (const u of input.urls) {
      const t = await extractFromUrl(u);
      if (t) parts.push(`[URL: ${u}]\n${t}`);
    }
  }
  if (input.imageUrls?.length) {
    for (const img of input.imageUrls) {
      const t = await ocrImagePlaceholder(img);
      if (t) parts.push(`[IMAGE: ${img} OCR]\n${t}`);
    }
  }
  if (input.captureSnippets?.length) {
    for (const s of input.captureSnippets) {
      parts.push(`[CAPTURE]\n${s}`);
    }
  }
  const merged = parts.join("\n\n---\n\n").slice(0, 80000);
  if (!merged) {
    return { error: "No analyzable text" };
  }

  // 2) Call model
  const system = truthSystemPrompt();
  const user = truthUserPrompt({
    title: input.title,
    mergedText: merged,
    sourceHints: input.urls,
  });

  const result = await chatJSON({
    model: MODEL_STRICT,
    system,
    user,
    maxTokens: 2000,
  });

  // 3) Persist
  const truthCheckId = await saveTruthCheck({
    userId,
    projectId: projectId ?? null,
    title: input.title,
    inputText: input.text,
    inputUrls: input.urls,
    inputImages: input.imageUrls,
    result,
    confidence: result?.confidence,
    status: "complete",
  });

  const ev: any[] = Array.isArray(result?.evidence) ? result.evidence : [];
  if (ev.length) {
    await saveEvidence(truthCheckId, ev.map((e) => ({
      quote: e.quote,
      url: e.url,
      source: e.source,
      timestamp: e.timestamp,
    })));
  }

  // Compute and update triage fields
  const triageResult = computeTriage(result);
  await updateTriageFields(truthCheckId, triageResult);

  return { truthCheckId, result };
}