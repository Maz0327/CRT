let PROJECT_ID: string | null = null;
export function setScopedProjectId(id: string | null) { PROJECT_ID = id; }

const RAW_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";
const API_BASE = String(RAW_BASE).replace(/\/$/, "");
export const IS_MOCK_MODE: boolean = String(
  (import.meta as any).env?.VITE_MOCK_AUTH ?? ""
).toLowerCase() === "true";

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> ?? {})
  };
  if (PROJECT_ID) headers["X-Project-ID"] = PROJECT_ID;

  const res = await fetch(url, { ...init, headers, credentials: "include" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const data = text ? JSON.parse(text) : {};
      throw new Error(data?.error || data?.message || `${res.status} ${res.statusText}`);
    } catch {
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
  }

  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json")
    ? await res.json()
    : await res.text()) as T;
}

export const api = {
  request,
  get<T = any>(p: string) { return request<T>(p, { method: "GET" }); },
  post<T = any>(p: string, b?: Json) { return request<T>(p, { method: "POST", body: b===undefined?undefined:JSON.stringify(b) }); },
  patch<T = any>(p: string, b?: Json) { return request<T>(p, { method: "PATCH", body: b===undefined?undefined:JSON.stringify(b) }); },
  delete<T = any>(p: string) { return request<T>(p, { method: "DELETE" }); },
};