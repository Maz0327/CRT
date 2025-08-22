let stream, recorder, chunks = [];

async function ensureStream(tabId) {
  // Prefer tabCapture; fallback to getDisplayMedia
  try {
    stream = await chrome.tabCapture.capture({ audio: false, video: true, videoConstraints: { mandatory: { maxWidth: 1920, maxHeight: 1080, maxFrameRate: 30 } } });
  } catch (e) {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false });
  }
  return stream;
}

// Attempt cropping via CropTarget (Chrome >= 104)
async function applyCrop(rect) {
  try {
    const [track] = stream.getVideoTracks();
    const target = await CropTarget.fromRect(rect.x, rect.y, rect.width, rect.height);
    if (track.cropTo) await track.cropTo(target);
  } catch { /* ignore; not supported */ }
}

async function record(rect, durationMs = 0) {
  chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise(res => (recorder.onstop = res));
  recorder.start(250);
  if (durationMs > 0) setTimeout(() => recorder.stop(), durationMs);
  await done;
  return new Blob(chunks, { type: "video/webm" });
}

async function snapshot(rect) {
  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();
  const canvas = Object.assign(document.createElement("canvas"), { width: rect.width, height: rect.height });
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return new Promise((res) => canvas.toBlob(res, "image/png"));
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "START_CAPTURE") {
      await ensureStream(msg.tabId);
      await applyCrop(msg.rect);
      sendResponse({ ok: true });
    }
    if (msg.type === "RECORD_REGION") {
      const blob = await record(msg.rect, msg.durationMs);
      sendResponse({ ok: true, blob: await blobToBase64(blob) });
    }
    if (msg.type === "SCREENSHOT_REGION") {
      const blob = await snapshot(msg.rect);
      sendResponse({ ok: true, blob: await blobToBase64(blob) });
    }
    if (msg.type === "STOP_CAPTURE") {
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      if (recorder && recorder.state !== "inactive") recorder.stop();
      sendResponse({ ok: true });
    }
  })().catch(err => {
    console.error(err);
    sendResponse({ ok: false, error: String(err) });
  });
  return true;
});

async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}