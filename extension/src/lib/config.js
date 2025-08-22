// Adjust at runtime via settings; default points to same origin '/api'
export async function getApiBase() {
  const { apiBase } = await chrome.storage.sync.get({ apiBase: "/api" });
  return apiBase || "/api";
}
export const EXT_VERSION = "0.1.0";