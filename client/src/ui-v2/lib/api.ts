// Canonical API helper for UI v2

let scopedProjectId: string | undefined;

export function setScopedProjectId(id?: string) {
  scopedProjectId = id?.trim() || undefined;
}

// Keep this export to satisfy existing imports
export const IS_MOCK_MODE = Boolean(import.meta.env.VITE_MOCK_AUTH);

// Base request wrapper (proxied in dev via Vite)
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (scopedProjectId) {
    headers.set("X-Project-ID", scopedProjectId);
  }

  const res = await fetch(`/api${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${errText || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // fallback — return raw text when not JSON
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...(init || {}) }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...(init || {}) }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...(init || {}) }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "DELETE", ...(init || {}) }),
};