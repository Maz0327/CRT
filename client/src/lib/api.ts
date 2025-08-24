// client/src/lib/api.ts
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? '/api';

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body && typeof init.body !== 'string' && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { credentials: 'include', ...init, headers });
  const text = await res.text();

  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    const err = new Error(msg) as any;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  request,
  get<T = unknown>(path: string) {
    return request<T>(path);
  },
  post<T = unknown>(path: string, body?: any) {
    return request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
  },
  patch<T = unknown>(path: string, body?: any) {
    return request<T>(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) });
  },
  put<T = unknown>(path: string, body?: any) {
    return request<T>(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) });
  },
  del<T = unknown>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};

export default api;