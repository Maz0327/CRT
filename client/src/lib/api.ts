// client/src/lib/api.ts
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

const BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  '/api';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${init.method || 'GET'} ${url} failed: ${res.status} ${text}`);
  }
  // allow empty responses
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json().catch(() => ({}))) as T;
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