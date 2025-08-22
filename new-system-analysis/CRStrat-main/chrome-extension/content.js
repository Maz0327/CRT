// Content Script for Content Radar Extension

class ContentCapture {
  constructor() {
    this.isOverlayActive = false;
    this.selectedElement = null;
    this.init();
  }

  init() {
    this.createCaptureButton();
    this.setupEventListeners();
  }

  createCaptureButton() {
    // Floating capture button
    const button = document.createElement('div');
    button.id = 'content-radar-capture-btn';
    button.innerHTML = '📡';
    button.title = 'Capture with Content Radar';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      opacity: 0.8;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.opacity = '1';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.opacity = '0.8';
    });

    button.addEventListener('click', () => this.startCapture());
    document.body.appendChild(button);
  }

  setupEventListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'capture_selection') {
        this.captureSelection(request.data.selectedText);
      }
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.startCapture();
      }
    });
  }

  startCapture() {
    if (this.isOverlayActive) return;
    
    this.isOverlayActive = true;
    this.createSelectionOverlay();
  }

  createSelectionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'content-radar-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      z-index: 9999;
      cursor: crosshair;
    `;

    const instructions = document.createElement('div');
    instructions.textContent = 'Click on any element to capture it, or press Escape to cancel';
    instructions.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: system-ui, -apple-system, sans-serif;
      color: #333;
    `;

    overlay.appendChild(instructions);
    document.body.appendChild(overlay);

    // Element highlighting
    let highlightedElement = null;
    const highlightBorder = document.createElement('div');
    highlightBorder.style.cssText = `
      position: absolute;
      border: 3px solid #667eea;
      background: rgba(102, 126, 234, 0.1);
      pointer-events: none;
      z-index: 10000;
      transition: all 0.1s ease;
    `;
    document.body.appendChild(highlightBorder);

    const handleMouseMove = (e) => {
      if (e.target === overlay || e.target === instructions) return;
      
      if (highlightedElement !== e.target) {
        highlightedElement = e.target;
        const rect = e.target.getBoundingClientRect();
        highlightBorder.style.display = 'block';
        highlightBorder.style.left = rect.left + 'px';
        highlightBorder.style.top = rect.top + 'px';
        highlightBorder.style.width = rect.width + 'px';
        highlightBorder.style.height = rect.height + 'px';
      }
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.target === overlay || e.target === instructions) return;
      
      this.captureElement(e.target);
      cleanup();
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
      }
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
      overlay.remove();
      highlightBorder.remove();
      this.isOverlayActive = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
  }

  async captureElement(element) {
    const captureData = this.extractElementData(element);
    await this.sendCapture(captureData);
  }

  async captureSelection(selectedText) {
    const captureData = {
      title: document.title,
      content: selectedText || 'No text selected',
      url: window.location.href,
      platform: this.detectPlatform(),
      tags: [],
      source_author: this.extractAuthor(),
      timestamp: new Date().toISOString()
    };

    await this.sendCapture(captureData);
  }

  extractElementData(element) {
    // Extract text content
    let content = element.innerText || element.textContent || '';
    
    // If it's an image, capture alt text or nearby text
    if (element.tagName === 'IMG') {
      content = element.alt || element.title || 'Image captured';
    }

    // Get any associated links
    const links = Array.from(element.querySelectorAll('a')).map(a => a.href);

    return {
      title: document.title,
      content: content.trim(),
      url: window.location.href,
      platform: this.detectPlatform(),
      tags: this.extractTags(element),
      selection_rect: {
        x: element.getBoundingClientRect().left,
        y: element.getBoundingClientRect().top,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height
      },
      source_author: this.extractAuthor(),
      source_metrics: this.extractMetrics(element),
      timestamp: new Date().toISOString(),
      element_type: element.tagName.toLowerCase(),
      element_classes: element.className,
      associated_links: links
    };
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    
    const platforms = {
      'twitter.com': 'Twitter',
      'linkedin.com': 'LinkedIn',
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'youtube.com': 'YouTube',
      'reddit.com': 'Reddit',
      'tiktok.com': 'TikTok',
      'medium.com': 'Medium',
      'substack.com': 'Substack'
    };

    for (const [domain, platform] of Object.entries(platforms)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }

    return 'Web';
  }

  extractTags(element) {
    const tags = [];
    
    // Extract from element classes
    if (element.className) {
      const classes = element.className.split(' ');
      tags.push(...classes.filter(c => c.length > 2 && c.length < 20));
    }

    // Extract from data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && attr.value) {
        tags.push(attr.value);
      }
    }

    return tags.slice(0, 10); // Limit to 10 tags
  }

  extractAuthor() {
    // Common author selectors across platforms
    const authorSelectors = [
      '[data-testid="User-Names"]',
      '.author',
      '.username',
      '.user-name',
      '.post-author',
      '[rel="author"]',
      '.byline'
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    // Extract from meta tags
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta) {
      return authorMeta.content;
    }

    return null;
  }

  extractMetrics(element) {
    const metrics = {};

    // Look for engagement metrics nearby
    const parent = element.closest('[data-testid], .post, .tweet, .story');
    if (parent) {
      // Look for like/heart buttons
      const likeButton = parent.querySelector('[data-testid="like"], .like-button, .heart');
      if (likeButton) {
        const likeText = likeButton.textContent || likeButton.getAttribute('aria-label') || '';
        const likeCount = likeText.match(/\d+/);
        if (likeCount) metrics.likes = parseInt(likeCount[0]);
      }

      // Look for share/retweet buttons
      const shareButton = parent.querySelector('[data-testid="retweet"], .share-button, .repost');
      if (shareButton) {
        const shareText = shareButton.textContent || shareButton.getAttribute('aria-label') || '';
        const shareCount = shareText.match(/\d+/);
        if (shareCount) metrics.shares = parseInt(shareCount[0]);
      }
    }

    return Object.keys(metrics).length > 0 ? metrics : null;
  }

  async sendCapture(captureData) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'capture_content',
        data: captureData
      });

      if (response.success) {
        this.showSuccessNotification();
      } else {
        this.showErrorNotification(response.error);
      }
    } catch (error) {
      console.error('Capture failed:', error);
      this.showErrorNotification(error.message);
    }
  }

  showSuccessNotification() {
    this.showNotification('✅ Content captured successfully!', '#4CAF50');
  }

  showErrorNotification(error) {
    this.showNotification(`❌ Capture failed: ${error}`, '#f44336');
  }

  showNotification(message, color) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 10002;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
}

// Initialize content capture when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContentCapture());
} else {
  new ContentCapture();
}