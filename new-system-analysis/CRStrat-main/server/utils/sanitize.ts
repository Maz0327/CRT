import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_ATTR: ["href", "src", "alt"],
    ALLOWED_TAGS: [
      "a","b","i","em","strong","p","br","ul","ol","li","img","span","div","blockquote","code","pre"
    ],
  });
}