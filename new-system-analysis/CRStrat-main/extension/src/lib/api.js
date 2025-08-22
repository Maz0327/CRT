import { getApiBase, EXT_VERSION } from "./config.js";

async function getToken() {
  const { token, tokenExpiresAt } = await chrome.storage.local.get({ token: null, tokenExpiresAt: 0 });
  if (token && Date.now() < tokenExpiresAt - 60_000) return token;
  // Try refresh if available
  const { refreshToken } = await chrome.storage.local.get({ refreshToken: null });
  if (!refreshToken) return null;
  try {
    const base = await getApiBase();
    const res = await fetch(`${base}/extension/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-extension-version": EXT_VERSION },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
    const data = await res.json();
    await chrome.storage.local.set({ token: data.token, tokenExpiresAt: Date.now() + (data.expiresInMs ?? 3600_000) });
    return data.token;
  } catch (e) {
    console.warn("Token refresh failed", e);
    return null;
  }
}

export async function api(path, init = {}) {
  const base = await getApiBase();
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-extension-version", EXT_VERSION);
  const token = await getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

export async function pairWithCode(code) {
  const base = await getApiBase();
  const res = await fetch(`${base}/extension/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-extension-version": EXT_VERSION },
    body: JSON.stringify({ code })
  });
  if (!res.ok) throw new Error(`Pairing failed: ${res.status}`);
  const data = await res.json();
  await chrome.storage.local.set({
    token: data.token,
    tokenExpiresAt: Date.now() + (data.expiresInMs ?? 3600_000),
    refreshToken: data.refreshToken ?? null
  });
  return true;
}