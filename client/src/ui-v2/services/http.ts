const API_BASE = import.meta.env.VITE_API_BASE || "";
export const IS_MOCK_MODE =
  Boolean(import.meta.env.VITE_UIV2_MOCK) ||
  (typeof window !== "undefined" &&
    (window.location.hostname.includes("bolt") ||
     window.location.hostname.includes("stackblitz")));

export const api = {
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    try {
      const t = localStorage.getItem("sb-access-token");
      if (t) headers.set("Authorization", `Bearer ${t}`);
    } catch {}
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  },
};