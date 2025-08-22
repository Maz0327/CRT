// Convert API snake_case objects to UI camelCase, and vice-versa.
const snake = (k: string) =>
  k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
const camel = (k: string) =>
  k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export function toCamel<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map((x) => toCamel(x)) as any;
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[camel(k)] = toCamel(v);
    return out;
  }
  return obj;
}

export function toSnake<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map((x) => toSnake(x)) as any;
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[snake(k)] = toSnake(v);
    return out;
  }
  return obj;
}

export function ensureArray<T>(val: T[] | T | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  return [val as T];
}