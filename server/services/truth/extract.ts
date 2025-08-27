import fetch from "node-fetch";

export async function extractFromUrl(url: string): Promise<string> {
  // MVP: fetch raw HTML and fallback to text content
  // (You can upgrade to Readability later.)
  try {
    const res = await fetch(url, { timeout: 10000 });
    const html = await res.text();
    // naive strip
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ")
                     .replace(/<style[\s\S]*?<\/style>/gi, " ")
                     .replace(/<[^>]+>/g, " ")
                     .replace(/\s+/g, " ")
                     .trim();
    return text.slice(0, 40000); // cap
  } catch {
    return "";
  }
}

// OCR hook (wire to Google Vision later); return "" when not available
export async function ocrImagePlaceholder(_publicUrl: string): Promise<string> {
  return ""; // keep placeholder in this step; we'll upgrade in a later step
}