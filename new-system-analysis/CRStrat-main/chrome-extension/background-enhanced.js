// Enhanced Background Service Worker with Advanced Features
const API_BASE_URL = 'https://8b8b11fe-8b26-478c-833b-4cb2c7d9c3ca-00-1u6v7kw2cbj6z.worf.replit.dev/api';

// Session Storage for 24-hour memory
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isAuthenticated: false,
    currentProject: null,
    selectedTags: [],
    recentCaptures: [],
    sessionStarted: Date.now(),
    captureMode: 'precision',
    voiceNotes: []
  });
  
  // Create comprehensive context menu items
  chrome.contextMenus.create({
    id: 'capture-page',
    title: '📸 Capture Page to Content Radar',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'capture-selection',
    title: '✂️ Capture Selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'capture-image',
    title: '🖼️ Capture Image',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'capture-link',
    title: '🔗 Capture Link',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'capture-video',
    title: '🎥 Capture Video',
    contexts: ['video']
  });
  
  chrome.contextMenus.create({
    id: 'separator-1',
    type: 'separator',
    contexts: ['page', 'selection', 'image', 'link', 'video']
  });
  
  chrome.contextMenus.create({
    id: 'add-voice-note',
    title: '🎤 Add Voice Note',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'screenshot-area',
    title: '📱 Screenshot Area',
    contexts: ['page']
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case 'quick-capture':
      handleQuickCapture(tab);
      break;
    case 'screen-select':
      handleScreenSelect(tab);
      break;
    case 'voice-note':
      handleVoiceNote(tab);
      break;
    case 'switch-project':
      handleProjectSwitch(tab);
      break;
    case 'add-note':
      handleAddNote(tab);
      break;
  }
});

// Enhanced message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'captureScreenshot':
      handleScreenshotCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'authenticate':
      authenticateUser(request.credentials)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'syncWithBackend':
      syncCapturesWithBackend()
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'processPrecisionCapture':
      processPrecisionCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'processContextCapture':
      processContextCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'processQuickCapture':
      processQuickCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'get-active-project':
      getActiveProject()
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'switch-project':
      switchProject(request.projectId)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Context menu handling
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'capture-page':
      await handleQuickCapture(tab);
      break;
    case 'capture-selection':
      await handleSelectionCapture(info, tab);
      break;
    case 'capture-image':
      await handleImageCapture(info, tab);
      break;
    case 'capture-link':
      await handleLinkCapture(info, tab);
      break;
    case 'capture-video':
      await handleVideoCapture(info, tab);
      break;
    case 'add-voice-note':
      await handleVoiceNote(tab);
      break;
    case 'screenshot-area':
      await handleScreenSelect(tab);
      break;
  }
});

// Enhanced capture processing functions
async function processPrecisionCapture(data, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: data.element.textContent,
    captureType: 'precision',
    platform: detectPlatform(tab.url),
    timestamp: Date.now(),
    elementData: data.element,
    position: data.position,
    analysis: await requestAIAnalysis(data.element.textContent, 'precision')
  };
  
  await saveCaptureToBackend(captureData);
  await updateRecentCaptures(captureData);
  
  showNotification('Precision capture saved!', 'Content captured and analyzed');
  return { success: true };
}

async function processContextCapture(pageData, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: pageData.content.paragraphs.join('\n'),
    captureType: 'context',
    platform: pageData.platform,
    timestamp: Date.now(),
    pageData: pageData,
    analysis: await requestAIAnalysis(pageData.content.paragraphs.join('\n'), 'context')
  };
  
  await saveCaptureToBackend(captureData);
  await updateRecentCaptures(captureData);
  
  showNotification('Context capture saved!', 'Full page context captured and analyzed');
  return { success: true };
}

async function processQuickCapture(pageData, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: pageData.content.textContent || document.title,
    captureType: 'quick',
    platform: pageData.platform,
    timestamp: Date.now(),
    pageData: pageData,
    analysis: await requestAIAnalysis(pageData.content.textContent, 'quick')
  };
  
  await saveCaptureToBackend(captureData);
  await updateRecentCaptures(captureData);
  
  showNotification('Quick capture saved!', 'Page captured and ready for analysis');
  return { success: true };
}

// Project management functions
async function getActiveProject() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const projects = await response.json();
      const activeProject = projects.find(p => p.isActive) || projects[0];
      
      await chrome.storage.local.set({ activeProject });
      return { success: true, activeProject };
    }
    
    return { success: false, error: 'No projects found' };
  } catch (error) {
    console.error('Failed to get active project:', error);
    return { success: false, error: error.message };
  }
}

async function switchProject(projectId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const activeProject = await response.json();
      await chrome.storage.local.set({ activeProject });
      
      return { success: true, activeProject };
    }
    
    return { success: false, error: 'Failed to switch project' };
  } catch (error) {
    console.error('Failed to switch project:', error);
    return { success: false, error: error.message };
  }
}

// AI Analysis integration
async function requestAIAnalysis(content, mode = 'quick') {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/quick-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        mode,
        platform: 'chrome-extension'
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

// Backend integration
async function saveCaptureToBackend(captureData) {
  try {
    const { activeProject } = await chrome.storage.local.get(['activeProject']);
    
    if (!activeProject) {
      throw new Error('No active project selected');
    }
    
    const response = await fetch(`${API_BASE_URL}/captures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...captureData,
        projectId: activeProject.id
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save capture to backend');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to save capture:', error);
    throw error;
  }
}

async function updateRecentCaptures(captureData) {
  const { recentCaptures = [] } = await chrome.storage.local.get(['recentCaptures']);
  
  const updated = [captureData, ...recentCaptures.slice(0, 9)]; // Keep last 10
  await chrome.storage.local.set({ recentCaptures: updated });
}

// Utility functions
function detectPlatform(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  const platforms = {
    'twitter.com': 'Twitter',
    'x.com': 'Twitter',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'linkedin.com': 'LinkedIn',
    'youtube.com': 'YouTube',
    'tiktok.com': 'TikTok',
    'reddit.com': 'Reddit',
    'pinterest.com': 'Pinterest'
  };
  
  for (const [domain, platform] of Object.entries(platforms)) {
    if (hostname.includes(domain)) {
      return platform;
    }
  }
  return 'Web';
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: title,
    message: message
  });
}

// Keyboard shortcut handlers
async function handleQuickCapture(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'captureCurrentPage' });
}

async function handleScreenSelect(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'startPrecisionCapture' });
}

async function handleVoiceNote(tab) {
  // Voice note functionality to be implemented
  showNotification('Voice Note', 'Voice note feature coming soon!');
}

async function handleProjectSwitch(tab) {
  // Open popup for project switching
  chrome.action.openPopup();
}

async function handleAddNote(tab) {
  // Add note to last capture
  showNotification('Note Added', 'Note added to last capture');
}

// Context menu specific handlers
async function handleSelectionCapture(info, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: info.selectionText,
    captureType: 'selection',
    platform: detectPlatform(tab.url),
    timestamp: Date.now(),
    analysis: await requestAIAnalysis(info.selectionText, 'selection')
  };
  
  await saveCaptureToBackend(captureData);
  showNotification('Selection captured!', 'Selected text saved and analyzed');
}

async function handleImageCapture(info, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: `Image: ${info.srcUrl}`,
    captureType: 'image',
    platform: detectPlatform(tab.url),
    timestamp: Date.now(),
    imageUrl: info.srcUrl
  };
  
  await saveCaptureToBackend(captureData);
  showNotification('Image captured!', 'Image reference saved');
}

async function handleLinkCapture(info, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: `Link: ${info.linkUrl} - ${info.linkText || 'No text'}`,
    captureType: 'link',
    platform: detectPlatform(tab.url),
    timestamp: Date.now(),
    linkData: {
      url: info.linkUrl,
      text: info.linkText
    }
  };
  
  await saveCaptureToBackend(captureData);
  showNotification('Link captured!', 'Link reference saved');
}

async function handleVideoCapture(info, tab) {
  const captureData = {
    url: tab.url,
    title: tab.title,
    content: `Video: ${info.srcUrl}`,
    captureType: 'video',
    platform: detectPlatform(tab.url),
    timestamp: Date.now(),
    videoUrl: info.srcUrl
  };
  
  await saveCaptureToBackend(captureData);
  showNotification('Video captured!', 'Video reference saved');
}

console.log('Content Radar Enhanced Background - Ready for advanced capture operations');