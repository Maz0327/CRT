// client/src/ui-v2/lib/api.ts
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
type Json = Record<string, any> | any[];
type Query = Record<string, string | number | boolean | undefined>;

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "/api";

export const IS_MOCK_MODE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_MOCK_AUTH === "1") || false;

let __scopedProjectId: string | null = null;
export function setScopedProjectId(id: string | null) {
  __scopedProjectId = id ?? null;
}

function getToken(): string | null {
  try { 
    // For development, provide a mock token to bypass authentication
    const token = localStorage.getItem("sb-access-token");
    return token || "dev-mock-token";
  } catch { return "dev-mock-token"; }
}

function toQuery(params?: Query): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function request<T>(method: HttpMethod, path: string, body?: Json | FormData, headers?: HeadersInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const h = new Headers(headers || {});
  const token = getToken();
  if (token) h.set("Authorization", `Bearer ${token}`);

  // NEW: project scoping header
  if (__scopedProjectId) h.set("X-Project-ID", __scopedProjectId);

  const init: RequestInit = { method, headers: h };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, params?: Query, headers?: HeadersInit) =>
    request<T>("GET", `${path}${toQuery(params)}`, undefined, headers),
  post: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("POST", path, body, headers),
  patch: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("PATCH", path, body, headers),
  del: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("DELETE", path, body, headers),
};