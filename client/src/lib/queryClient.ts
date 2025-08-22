// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

const API_BASE =
  (typeof window !== "undefined" && (window as any).__API_BASE__) ||
  "/api";

// Core fetch that always sends JSON and returns parsed JSON
export async function apiRequest<T = any>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${txt}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Convenience JSON methods
export const api = {
  get:   <T = any>(url: string) => apiRequest<T>(url),
  post:  <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: "POST",  body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del:   <T = any>(url: string) =>
    apiRequest<T>(url, { method: "DELETE" }),

  // helpers used by the app
  getScheduleStatus: <T = any>() => api.get<T>("/api/scheduler/status"),
  runScan:           <T = any>() => api.post<T>("/api/scheduler/run"),
  exportData:        <T = any>(format: string) => api.get<T>(`/api/exports?format=${encodeURIComponent(format)}`),
  generateAdditionalHooks: <T = any>(id: string) => api.post<T>(`/api/captures/${id}/hooks`),
  getStats:          <T = any>() => api.get<T>("/api/analytics/stats"),
  getContent:        <T = any>(params?: Record<string, any>) => {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return api.get<T>(`/api/captures${qs}`);
  },
};

export const queryClient = new QueryClient();