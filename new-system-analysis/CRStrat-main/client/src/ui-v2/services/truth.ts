import { api } from "../lib/api";
import type { ID } from "../types";

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

export function extractSource(input: { projectId?: ID | null; url?: string; text?: string; imagePath?: string; }) {
  return api.post< { ok: true, check: TruthCheck } >("/truth/extract", input);
}

export function analyzeText(id: ID, opts?: { quick?: boolean }) {
  const q = opts?.quick === false ? "false" : "true";
  return api.post<{ ok: true, check: TruthCheck }>(`/truth/analyze-text/${id}?quick=${q}`, {});
}

export function analyzeVisual(id: ID, opts?: { quick?: boolean }) {
  const q = opts?.quick === false ? "false" : "true";
  return api.post<{ ok: true, check: TruthCheck }>(`/truth/analyze-visual/${id}?quick=${q}`, {});
}

export function getTruthCheck(id: ID) {
  return api.get<TruthCheck>(`/truth/check/${id}`);
}

export function retryTruthCheck(id: ID) {
  return api.post<{ ok: true, check: TruthCheck }>(`/truth/retry/${id}`, {});
}