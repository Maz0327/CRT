import { api } from "../lib/api.js";

// Simple queue stored in chrome.storage.local
async function enqueue(item) {
  const { queue = [] } = await chrome.storage.local.get({ queue: [] });
  queue.push(item);
  await chrome.storage.local.set({ queue });
}

async function dequeue() {
  const { queue = [] } = await chrome.storage.local.get({ queue: [] });
  const item = queue.shift();
  await chrome.storage.local.set({ queue });
  return item;
}

async function peekQueue() {
  const { queue = [] } = await chrome.storage.local.get({ queue: [] });
  return queue;
}

async function processQueue() {
  const q = await peekQueue();
  if (!q.length) return;
  const job = await dequeue();
  try {
    if (job.type === "upload") {
      // init upload session
      const init = await api("/extension/uploads", {
        method: "POST",
        body: JSON.stringify({ filename: job.filename, mime: job.mime, size: job.size })
      });

      // chunk upload
      const chunkSize = 1024 * 1024 * 5; // 5MB
      let offset = 0;
      while (offset < job.blob.size) {
        const chunk = job.blob.slice(offset, offset + chunkSize);
        const buf = await chunk.arrayBuffer();
        await fetch((await getUploadUrl(init.id)), {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream", "x-chunk-offset": String(offset) },
          body: buf
        });
        offset += chunkSize;
      }
      // complete
      await api(`/extension/uploads/${init.id}/complete`, { method: "POST" });

      // create capture + link
      const payload = {
        projectId: job.meta.projectId ?? null,
        tags: job.meta.tags ?? [],
        sourceUrl: job.meta.url ?? "",
        platform: job.meta.platform ?? null,
        uploadId: init.id
      };
      const cap = await api("/captures", { method: "POST", body: JSON.stringify(payload) });

      // Fast analysis for images / short clips
      if (job.meta.requestFastAnalysis) {
        await api("/analysis/queue", { method: "POST", body: JSON.stringify({ captureId: cap.id, mode: "fast" }) });
      }
    }
  } catch (e) {
    console.error("Queue job failed, re-enqueueing", e);
    await enqueue(job); // naive retry; could add backoff
  }
}

// helper to fetch upload URL from server; could be stable or per-chunk
async function getUploadUrl(id) {
  // In your server implementation you can return a stable PUT URL or require
  // per-chunk URLs. For now assume stable:
  const base = (await chrome.storage.sync.get({ apiBase: "/api" })).apiBase || "/api";
  return `${base}/extension/uploads/${id}/chunk`;
}

// Process queue periodically
chrome.alarms.create("processQueue", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "processQueue") processQueue();
});

// Messages from popup or content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "PAIR_WITH_CODE") {
      const { pairWithCode } = await import("../lib/api.js");
      await pairWithCode(msg.code);
      sendResponse({ ok: true });
    }
    if (msg.type === "ENQUEUE_UPLOAD") {
      // msg.payload: { blob, filename, mime, size, meta }
      await enqueue(msg.payload);
      sendResponse({ ok: true });
    }
    if (msg.type === "PROCESS_NOW") {
      await processQueue();
      sendResponse({ ok: true });
    }
  })().catch(err => {
    console.error(err);
    sendResponse({ ok: false, error: String(err) });
  });
  return true; // async
});