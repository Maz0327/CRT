(function () {
  let overlay, box, start, current, active = false;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "cr-overlay";
    document.documentElement.appendChild(overlay);
    return overlay;
  }

  function startDrag(e) {
    active = true;
    start = { x: e.clientX, y: e.clientY };
    current = { ...start };
    box = document.createElement("div");
    box.className = "cr-mask";
    overlay.appendChild(box);
    updateBox();
  }

  function moveDrag(e) {
    if (!active) return;
    current = { x: e.clientX, y: e.clientY };
    updateBox();
  }

  function endDrag() {
    if (!active) return;
    active = false;
    const rect = box.getBoundingClientRect();
    const payload = { x: rect.left, y: rect.top, width: rect.width, height: rect.height, devicePixelRatio: window.devicePixelRatio, url: location.href };
    box.remove(); box = null;
    chrome.runtime.sendMessage({ type: "BOUNDING_BOX_SELECTED", rect: payload });
    window.removeEventListener("mousemove", moveDrag);
    window.removeEventListener("mouseup", endDrag);
  }

  function updateBox() {
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(start.x - current.x);
    const h = Math.abs(start.y - current.y);
    Object.assign(box.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "OPEN_OVERLAY") {
      ensureOverlay();
      window.addEventListener("mousedown", startDrag, { once: true });
      window.addEventListener("mousemove", moveDrag);
      window.addEventListener("mouseup", endDrag);
    }
  });
})();