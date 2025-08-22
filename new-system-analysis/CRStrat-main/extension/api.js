export async function getSettings() {
  return new Promise(res => chrome.storage.local.get(["apiBase", "accessToken"], (o) => {
    res({ apiBase: (o.apiBase || "").trim(), accessToken: (o.accessToken || "").trim() });
  }));
}

export async function setSettings({ apiBase, accessToken }) {
  return new Promise(res => chrome.storage.local.set({ apiBase: apiBase || "", accessToken: accessToken || "" }, res));
}

export async function request(path, { method = "GET", headers = {}, body } = {}) {
  const { apiBase, accessToken } = await getSettings();
  const base = apiBase || inferDefaultApiBase();
  const url = normalizeUrl(base, path);
  const h = new Headers(headers);
  if (!h.has("Authorization") && accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  const res = await fetch(url, { method, headers: h, body });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export function buildForm(data) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
    else if (v !== undefined && v !== null) fd.append(k, v);
  }
  return fd;
}

export async function listProjects() {
  return request("/projects");
}
export async function uploadCapture({ file, notes, projectId }) {
  const body = buildForm({ file, notes, projectId: projectId || "" });
  return request("/captures/upload", { method: "POST", body });
}
export async function runTruth({ type, url, text, file }) {
  if (type === "image") {
    const body = buildForm({ type, file });
    return request("/truth_checks/run", { method: "POST", body });
  }
  return request("/truth_checks/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, url, text })
  });
}
export async function listRecentTruth() {
  return request("/truth_checks/recent");
}

function inferDefaultApiBase() {
  // For dev, try to call same origin server on /api
  return "/api";
}
function normalizeUrl(base, path) {
  const b = base.endsWith("/") ? base.slice(0,-1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}