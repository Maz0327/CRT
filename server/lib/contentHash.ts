import crypto from "crypto";

export function normalizeForHash(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s.,:;!?/-]/gu, "") // keep basic punctuation
    .trim();
}

export function contentHash(parts: Array<string | undefined | null>): string {
  const normalized = parts
    .filter(Boolean)
    .map(s => normalizeForHash(String(s)))
    .join(" | ");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}