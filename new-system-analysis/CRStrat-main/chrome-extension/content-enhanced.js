// Enhanced Content Script with Screenshot Selection from transferred code
console.log('Content Radar Enhanced - Loading advanced features...');

// Load screenshot selector script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content/screenshot-selector.js');
script.onload = function() {
  console.log('Screenshot selector loaded');
};
document.head.appendChild(script);

// Voice recording indicator
let voiceIndicator = null;
let isRecording = false;

// Advanced Visual Feedback System
class VisualFeedback {
  constructor() {
    this.overlay = null;
    this.border = null;
    this.tooltip = null;
  }

  showPrecisionMode() {
    this.cleanup();
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'content-radar-precision-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 235, 59, 0.05);
      pointer-events: none;
      z-index: 999999;
      animation: pulse 2s infinite;
    `;
    document.body.appendChild(this.overlay);
    this.showTooltip('Precision Mode: Click elements to capture');
  }

  showContextMode() {
    this.cleanup();
    
    this.border = document.createElement('div');
    this.border.className = 'content-radar-context-border';
    this.border.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 3px solid #3B82F6;
      border-radius: 8px;
      pointer-events: none;
      z-index: 999999;
      animation: glow 2s infinite;
      box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2);
    `;
    document.body.appendChild(this.border);
    this.showTooltip('Context Mode: Capturing full page context');
  }

  showTooltip(message) {
    if (this.tooltip) this.tooltip.remove();
    
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1F2937;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      z-index: 9999999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    this.tooltip.textContent = message;
    document.body.appendChild(this.tooltip);
    
    setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => this.tooltip?.remove(), 300);
      }
    }, 3000);
  }

  cleanup() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.border) {
      this.border.remove();
      this.border = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
}

// Initialize visual feedback system
const visualFeedback = new VisualFeedback();

// Enhanced content analysis
class ContentAnalyzer {
  constructor() {
    this.pageData = null;
  }

  async analyzeCurrentPage() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      timestamp: Date.now(),
      content: this.extractContentSignals(),
      platform: this.detectPlatform(),
      metadata: this.extractMetadata(),
      socialSignals: this.extractSocialSignals(),
      visualElements: this.extractVisualElements()
    };

    this.pageData = pageData;
    return pageData;
  }

  extractContentSignals() {
    const textContent = document.body.innerText;
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }));
    
    return {
      textLength: textContent.length,
      wordCount: textContent.split(/\s+/).length,
      linkCount: links.length,
      links: links.slice(0, 10), // First 10 links
      headings: this.extractHeadings(),
      paragraphs: this.extractParagraphs()
    };
  }

  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const platforms = {
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'linkedin.com': 'LinkedIn',
      'youtube.com': 'YouTube',
      'tiktok.com': 'TikTok',
      'reddit.com': 'Reddit',
      'pinterest.com': 'Pinterest',
      'snapchat.com': 'Snapchat',
      'discord.com': 'Discord',
      'telegram.org': 'Telegram'
    };

    for (const [domain, platform] of Object.entries(platforms)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }
    return 'Web';
  }

  extractMetadata() {
    const meta = {};
    document.querySelectorAll('meta').forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (name && content) {
        meta[name] = content;
      }
    });
    return meta;
  }

  extractSocialSignals() {
    const signals = {
      likes: this.extractNumber(['like', 'heart', 'favorite']),
      shares: this.extractNumber(['share', 'retweet', 'forward']),
      comments: this.extractNumber(['comment', 'reply', 'response']),
      views: this.extractNumber(['view', 'watch', 'seen'])
    };
    return signals;
  }

  extractNumber(keywords) {
    for (const keyword of keywords) {
      const elements = document.querySelectorAll(`[aria-label*="${keyword}" i], [title*="${keyword}" i]`);
      for (const el of elements) {
        const text = el.textContent || el.getAttribute('aria-label') || el.getAttribute('title');
        const match = text.match(/[\d,]+/);
        if (match) {
          return parseInt(match[0].replace(/,/g, ''));
        }
      }
    }
    return 0;
  }

  extractVisualElements() {
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    })).slice(0, 5);

    const videos = Array.from(document.querySelectorAll('video')).map(video => ({
      src: video.src || video.currentSrc,
      duration: video.duration,
      poster: video.poster
    })).slice(0, 3);

    return { images, videos };
  }

  extractHeadings() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ level: h.tagName, text: h.textContent.trim() }))
      .slice(0, 10);
  }

  extractParagraphs() {
    return Array.from(document.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(text => text.length > 20)
      .slice(0, 5);
  }
}

// Initialize content analyzer
const contentAnalyzer = new ContentAnalyzer();

// Message handling from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startPrecisionCapture':
      visualFeedback.showPrecisionMode();
      initializePrecisionCapture();
      sendResponse({ success: true });
      break;
      
    case 'startContextCapture':
      visualFeedback.showContextMode();
      handleContextCapture();
      sendResponse({ success: true });
      break;
      
    case 'captureCurrentPage':
      handleQuickCapture();
      sendResponse({ success: true });
      break;
      
    case 'analyzeContent':
      contentAnalyzer.analyzeCurrentPage()
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'cleanup':
      visualFeedback.cleanup();
      sendResponse({ success: true });
      break;
  }
});

// Enhanced capture functions
function initializePrecisionCapture() {
  document.addEventListener('click', handlePrecisionClick, true);
  document.addEventListener('mouseover', highlightElement, true);
  document.addEventListener('mouseout', removeHighlight, true);
}

function handlePrecisionClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  const captureData = {
    element: {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent.slice(0, 500),
      innerHTML: element.innerHTML.slice(0, 1000)
    },
    position: {
      x: event.clientX,
      y: event.clientY,
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset
    }
  };
  
  chrome.runtime.sendMessage({
    action: 'processPrecisionCapture',
    data: captureData
  });
  
  cleanup();
}

function highlightElement(event) {
  const element = event.target;
  element.style.outline = '2px solid #3B82F6';
  element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
}

function removeHighlight(event) {
  const element = event.target;
  element.style.outline = '';
  element.style.backgroundColor = '';
}

async function handleContextCapture() {
  const pageData = await contentAnalyzer.analyzeCurrentPage();
  
  chrome.runtime.sendMessage({
    action: 'processContextCapture',
    data: pageData
  });
  
  visualFeedback.cleanup();
}

async function handleQuickCapture() {
  const pageData = await contentAnalyzer.analyzeCurrentPage();
  
  chrome.runtime.sendMessage({
    action: 'processQuickCapture',
    data: pageData
  });
}

function cleanup() {
  document.removeEventListener('click', handlePrecisionClick, true);
  document.removeEventListener('mouseover', highlightElement, true);
  document.removeEventListener('mouseout', removeHighlight, true);
  visualFeedback.cleanup();
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: inset 0 0 30px rgba(59, 130, 246, 0.4); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('Content Radar Enhanced - Ready for advanced capture modes');