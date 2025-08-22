// Advanced Screenshot Selection System from transferred code
class ScreenshotSelector {
  constructor() {
    this.isSelecting = false;
    this.overlay = null;
    this.selectionBox = null;
    this.toolbar = null;
    this.startX = 0;
    this.startY = 0;
    this.captureCallback = null;
  }

  start(callback) {
    if (this.isSelecting) return;
    
    this.isSelecting = true;
    this.captureCallback = callback;
    
    // Create full-screen overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.3);
    `;
    
    // Create selection box
    this.selectionBox = document.createElement('div');
    this.selectionBox.style.cssText = `
      position: fixed;
      border: 2px solid #4F46E5;
      background: rgba(79, 70, 229, 0.1);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 2147483647;
    `;
    
    // Add instruction text
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1F2937;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      z-index: 2147483648;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    instructions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📸</span>
        <span>Click and drag to select area • Press ESC to cancel</span>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.selectionBox);
    document.body.appendChild(instructions);
    
    // Store instructions reference for cleanup
    this.instructions = instructions;
    
    // Event listeners
    this.overlay.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.overlay.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.overlay.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Prevent scrolling while selecting
    document.body.style.overflow = 'hidden';
  }

  handleMouseDown(e) {
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    this.selectionBox.style.left = this.startX + 'px';
    this.selectionBox.style.top = this.startY + 'px';
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
    this.selectionBox.style.display = 'block';
  }

  handleMouseMove(e) {
    if (this.selectionBox.style.display !== 'block') return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    
    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
    
    // Update selection info
    if (width > 10 && height > 10) {
      this.showDimensions(width, height);
    }
  }

  handleMouseUp(e) {
    if (this.selectionBox.style.display !== 'block') return;
    
    const rect = this.selectionBox.getBoundingClientRect();
    
    if (rect.width > 10 && rect.height > 10) {
      this.showToolbar(rect);
    } else {
      this.cancel();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.cancel();
    }
  }

  showDimensions(width, height) {
    if (!this.dimensionDisplay) {
      this.dimensionDisplay = document.createElement('div');
      this.dimensionDisplay.style.cssText = `
        position: fixed;
        background: #1F2937;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        z-index: 2147483648;
        pointer-events: none;
      `;
      document.body.appendChild(this.dimensionDisplay);
    }
    
    this.dimensionDisplay.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    this.dimensionDisplay.style.left = (this.startX + 5) + 'px';
    this.dimensionDisplay.style.top = (this.startY - 25) + 'px';
  }

  showToolbar(rect) {
    // Remove overlay but keep selection visible
    this.overlay.style.background = 'transparent';
    this.overlay.style.pointerEvents = 'none';
    
    // Create toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.bottom + 10}px;
      background: #1F2937;
      padding: 8px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      z-index: 2147483648;
      display: flex;
      gap: 8px;
    `;
    
    // Capture button
    const captureBtn = document.createElement('button');
    captureBtn.style.cssText = `
      background: #4F46E5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    captureBtn.textContent = '📸 Capture';
    captureBtn.onmouseover = () => captureBtn.style.background = '#4338CA';
    captureBtn.onmouseout = () => captureBtn.style.background = '#4F46E5';
    captureBtn.onclick = () => this.capture(rect);
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = `
      background: #374151;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#4B5563';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#374151';
    cancelBtn.onclick = () => this.cancel();
    
    this.toolbar.appendChild(captureBtn);
    this.toolbar.appendChild(cancelBtn);
    document.body.appendChild(this.toolbar);
    
    // Adjust toolbar position if it goes off-screen
    const toolbarRect = this.toolbar.getBoundingClientRect();
    if (toolbarRect.bottom > window.innerHeight) {
      this.toolbar.style.top = (rect.top - toolbarRect.height - 10) + 'px';
    }
    if (toolbarRect.right > window.innerWidth) {
      this.toolbar.style.left = (window.innerWidth - toolbarRect.width - 10) + 'px';
    }
  }

  capture(rect) {
    // Clean up UI
    this.cleanup();
    
    // Convert to page coordinates (accounting for scroll)
    const selection = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      clientRect: rect,
      pageUrl: window.location.href,
      pageTitle: document.title,
      timestamp: new Date().toISOString()
    };
    
    // Execute callback
    if (this.captureCallback) {
      this.captureCallback(selection);
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'captureScreenshot',
      data: {
        selection,
        url: window.location.href,
        title: document.title,
        timestamp: selection.timestamp
      }
    });
  }

  cancel() {
    this.cleanup();
    if (this.captureCallback) {
      this.captureCallback(null);
    }
  }

  cleanup() {
    // Remove all elements
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    if (this.instructions) {
      this.instructions.remove();
      this.instructions = null;
    }
    if (this.dimensionDisplay) {
      this.dimensionDisplay.remove();
      this.dimensionDisplay = null;
    }
    
    // Restore scrolling
    document.body.style.overflow = '';
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    this.isSelecting = false;
  }
}

// Export for use in content script
window.ScreenshotSelector = ScreenshotSelector;