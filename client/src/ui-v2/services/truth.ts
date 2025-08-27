type ID = string;

import type { TruthCheckPayload } from "../types/truth";

export type TruthCheck = {
  id: string;
  status: string;
  extracted_text?: string | null;
  extracted_images?: string[] | null;
  result_truth?: any;
  result_strategic?: any;
  result_cohorts?: any;
  result_visual?: any;
  error?: string | null;
};

// MVP Step 37 implementation:
export async function createTruthCheck(payload: {
  text?: string;
  title?: string;
  urls?: string[];
  imageUrls?: string[];
  captureSnippets?: string[];
}) {
  // decide endpoint: single text vs bundle
  const isBundle = (payload.urls?.length || payload.imageUrls?.length || payload.captureSnippets?.length);
  const path = isBundle ? "/api/truth/analyze-bundle" : "/api/truth/analyze-text";
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // X-Project-ID is set globally in your fetch wrapper or add here if needed
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Truth analysis failed: ${res.status}`);
  return res.json() as Promise<{ truthCheckId: ID; result: any }>;
}

export async function getTruthCheck(id: ID) {
  const res = await fetch(`/api/truth/check/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`getTruthCheck failed: ${res.status}`);
  return res.json() as Promise<{
    check: {
      id: string;
      title: string | null;
      result: any;
      confidence: number | null;
      created_at: string;
    };
    evidence: Array<{
      id: string;
      quote: string | null;
      url: string | null;
      source: string | null;
      event_timestamp: string | null;
    }>;
  }>;
}

// Compatibility stubs for existing UI-V2 components (remove in later steps):
export function extractSource(_input: any) {
  throw new Error("extractSource not in Step 37, use createTruthCheck instead");
}

export async function analyzeText(input: {
  title?: string;
  text: string;
  projectId?: string;
}) {
  const res = await fetch(`/api/truth/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`analyzeText failed: ${res.status}`);
  return res.json() as Promise<{ truthCheckId: string; result?: any }>;
}

export async function fetchTruthCheck(id: string) {
  const res = await fetch(`/api/truth/check/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`fetchTruthCheck failed: ${res.status}`);
  return res.json() as Promise<TruthCheckPayload>;
}

export function analyzeVisual(_id: ID, _opts?: any) {
  throw new Error("analyzeVisual not in Step 37, use createTruthCheck instead");
}

export function retryTruthCheck(_id: ID) {
  throw new Error("retryTruthCheck not in Step 37");
}