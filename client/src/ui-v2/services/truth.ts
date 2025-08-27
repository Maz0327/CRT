type ID = string;

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

export function getTruthCheck(_id: ID) {
  // implement later when server exposes /api/truth/check/:id
  throw new Error("getTruthCheck not yet implemented in Step 37");
}

// Compatibility stubs for existing UI-V2 components (remove in later steps):
export function extractSource(_input: any) {
  throw new Error("extractSource not in Step 37, use createTruthCheck instead");
}

export function analyzeText(_id: ID, _opts?: any) {
  throw new Error("analyzeText not in Step 37, use createTruthCheck instead");
}

export function analyzeVisual(_id: ID, _opts?: any) {
  throw new Error("analyzeVisual not in Step 37, use createTruthCheck instead");
}

export function retryTruthCheck(_id: ID) {
  throw new Error("retryTruthCheck not in Step 37");
}