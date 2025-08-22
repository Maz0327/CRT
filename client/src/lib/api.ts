// client/src/lib/api.ts
export type Json = Record<string, any> | any[];

async function apiRequest<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  // try json, fallback to void
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? (await res.json()) as T : (undefined as T);
}

export const api = {
  get: <T = unknown>(url: string) => apiRequest<T>(url),
  post: <T = unknown>(url: string, body?: unknown) =>
    apiRequest<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(url: string, body?: unknown) =>
    apiRequest<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T = unknown>(url: string) =>
    apiRequest<T>(url, { method: "DELETE" }),
};