// Chrome Extension Background Script for Content Radar

class ContentRadarAPI {
  constructor() {
    this.baseURL = null;
    this.token = null;
    this.init();
  }

  async init() {
    // Load settings from storage
    const result = await chrome.storage.sync.get(['apiBaseURL', 'apiToken']);
    this.baseURL = result.apiBaseURL || 'https://your-content-radar-app.replit.dev';
    this.token = result.apiToken;
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('API token not configured. Please set up your token in the extension popup.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-extension-token': this.token,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  async captureContent(captureData) {
    return await this.makeRequest('/api/extension/capture', {
      method: 'POST',
      body: JSON.stringify(captureData)
    });
  }

  async healthCheck() {
    return await this.makeRequest('/api/extension/health');
  }
}

const api = new ContentRadarAPI();

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'capture_content':
          const result = await api.captureContent(request.data);
          sendResponse({ success: true, data: result });
          break;
          
        case 'health_check':
          const health = await api.healthCheck();
          sendResponse({ success: true, data: health });
          break;
          
        case 'get_settings':
          const settings = await chrome.storage.sync.get(['apiBaseURL', 'apiToken']);
          sendResponse({ success: true, data: settings });
          break;
          
        case 'save_settings':
          await chrome.storage.sync.set(request.data);
          api.baseURL = request.data.apiBaseURL;
          api.token = request.data.apiToken;
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Context menu for quick capture
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capture-selection",
    title: "Capture with Content Radar",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "capture-selection") {
    chrome.tabs.sendMessage(tab.id, {
      action: 'capture_selection',
      data: { selectedText: info.selectionText }
    });
  }
});

// Badge status updates
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const health = await api.healthCheck();
    chrome.action.setBadgeText({
      text: '✓',
      tabId: activeInfo.tabId
    });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } catch (error) {
    chrome.action.setBadgeText({
      text: '!',
      tabId: activeInfo.tabId
    });
    chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
  }
});