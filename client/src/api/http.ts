export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  projectId?: string | null
): Promise<T> {
  const base = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("sb-access-token") || sessionStorage.getItem("sb-access-token");

  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (projectId) headers.set("X-Project-ID", projectId);

  const res = await fetch(`${base}${path}`, { ...opts, headers, credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}