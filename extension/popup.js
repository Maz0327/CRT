import { getSettings, setSettings, listProjects, uploadCapture, runTruth, listRecentTruth } from "./api.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function setActiveTab(name) {
  $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach(s => s.classList.toggle("active", s.id === `tab-${name}`));
}

async function refreshProjects() {
  const select = $("#projectSelect");
  try {
    const { data = [] } = await listProjects();
    select.innerHTML = `<option value="">— None —</option>` + data.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  } catch (e) {
    // silent; user can still upload w/o project
  }
}

function bindTabs() {
  $$(".tabs button").forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });
  $("#truthType").addEventListener("change", e => {
    const t = e.target.value;
    $$("#tab-truth .row[data-for]").forEach(r => r.style.display = r.getAttribute("data-for") === t ? "" : "none");
  });
}

function bindSettings() {
  $("#btn-settings").addEventListener("click", async () => {
    const { apiBase, accessToken } = await getSettings();
    $("#apiBase").value = apiBase || "";
    $("#accessToken").value = accessToken || "";
    $("#settings").showModal();
  });
  $("#btnSaveSettings").addEventListener("click", async () => {
    const apiBase = $("#apiBase").value.trim();
    const accessToken = $("#accessToken").value.trim();
    await setSettings({ apiBase, accessToken });
    $("#settings").close();
    await refreshProjects();
  });
  $("#btnCloseSettings").addEventListener("click", () => $("#settings").close());
}

function setStatus(el, msg, ok=false) {
  el.textContent = msg;
  el.style.color = ok ? "limegreen" : "tomato";
}

function renderTruthResult(el, result) {
  if (!result) { el.textContent = ""; return; }
  const verdict = result.verdict || "unknown";
  const conf = (result.confidence ?? 0) * 100;
  const summary = result.summary || "";
  el.innerHTML = `<div class="card"><div><strong>Verdict:</strong> ${verdict} (${conf.toFixed(0)}%)</div><div>${summary}</div></div>`;
}

async function bindUpload() {
  $("#btnUpload").addEventListener("click", async () => {
    const status = $("#uploadStatus");
    const files = $("#fileInput").files;
    const notes = $("#notesInput").value.trim();
    const projectId = $("#projectSelect").value || "";
    if (!files?.length) return setStatus(status, "Please choose at least one file.");
    try {
      for (const file of files) {
        await uploadCapture({ file, notes, projectId });
      }
      setStatus(status, `Uploaded ${files.length} file(s).`, true);
    } catch (e) {
      setStatus(status, `Upload failed: ${e.message}`);
    }
  });
}

async function bindTruthLab() {
  $("#btnTruthRun").addEventListener("click", async () => {
    const type = $("#truthType").value;
    const resultEl = $("#truthResult");
    try {
      let res;
      if (type === "url") {
        const url = $("#truthUrl").value.trim();
        if (!url) throw new Error("URL required");
        res = await runTruth({ type, url });
      } else if (type === "text") {
        const text = $("#truthText").value.trim();
        if (!text) throw new Error("Text required");
        res = await runTruth({ type, text });
      } else {
        const f = $("#truthImage").files?.[0];
        if (!f) throw new Error("Image required");
        res = await runTruth({ type, file: f });
      }
      renderTruthResult(resultEl, res);
    } catch (e) {
      resultEl.textContent = `Error: ${e.message}`;
    }
  });
}

async function bindVisual() {
  $("#btnVisualRun").addEventListener("click", async () => {
    const resultEl = $("#visualResult");
    const f = $("#visualImage").files?.[0];
    if (!f) { resultEl.textContent = "Pick an image."; return; }
    try {
      const res = await runTruth({ type: "image", file: f });
      renderTruthResult(resultEl, res);
    } catch (e) {
      resultEl.textContent = `Error: ${e.message}`;
    }
  });
}

async function loadRecents() {
  const list = $("#recentList");
  list.innerHTML = `<div class="card">Loading…</div>`;
  try {
    const { data = [] } = await listRecentTruth();
    if (!data.length) { list.innerHTML = `<div class="card">No recent analyses.</div>`; return; }
    list.innerHTML = data.map((r) => {
      const v = r.verdict || "unknown";
      const c = Math.round((r.confidence ?? 0) * 100);
      const s = (r.summary || "").slice(0,160);
      return `<div class="card"><div><strong>${v}</strong> (${c}%)</div><div>${s}</div></div>`;
    }).join("");
  } catch (e) {
    list.innerHTML = `<div class="card">Error: ${e.message}</div>`;
  }
}

function bindTabsSideEffects() {
  // refresh recents when the tab is opened
  document.querySelector('[data-tab="recent"]').addEventListener("click", loadRecents);
}

(async function main(){
  bindTabs();
  bindSettings();
  await refreshProjects();
  await bindUpload();
  await bindTruthLab();
  await bindVisual();
  bindTabsSideEffects();
})();