// Popup script for Content Radar Extension

class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    this.setupTabs();
    this.setupEventListeners();
    await this.loadSettings();
    await this.checkConnection();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update tab appearance
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content visibility
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === targetTab + 'Tab') {
            content.classList.add('active');
          }
        });
      });
    });
  }

  setupEventListeners() {
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Test connection button
    document.getElementById('testConnectionBtn').addEventListener('click', () => {
      this.testConnection();
    });

    // Quick capture buttons
    document.getElementById('capturePageBtn').addEventListener('click', () => {
      this.capturePage();
    });

    document.getElementById('captureSelectionBtn').addEventListener('click', () => {
      this.captureSelection();
    });
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'get_settings' });
      if (response.success) {
        const { apiBaseURL, apiToken } = response.data;
        if (apiBaseURL) document.getElementById('apiBaseURL').value = apiBaseURL;
        if (apiToken) document.getElementById('apiToken').value = apiToken;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    const apiBaseURL = document.getElementById('apiBaseURL').value.trim();
    const apiToken = document.getElementById('apiToken').value.trim();

    if (!apiBaseURL || !apiToken) {
      this.showMessage('Please fill in both fields', 'error');
      return;
    }

    // Remove trailing slash from URL
    const cleanURL = apiBaseURL.replace(/\/$/, '');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'save_settings',
        data: { apiBaseURL: cleanURL, apiToken }
      });

      if (response.success) {
        this.showMessage('Settings saved successfully!', 'success');
        await this.checkConnection();
      } else {
        this.showMessage('Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showMessage('Failed to save settings', 'error');
    }
  }

  async testConnection() {
    const button = document.getElementById('testConnectionBtn');
    const originalText = button.textContent;
    
    button.textContent = 'Testing...';
    button.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({ action: 'health_check' });
      
      if (response.success) {
        this.showMessage('✅ Connection successful!', 'success');
        this.updateConnectionStatus(true, 'Connected');
      } else {
        this.showMessage('❌ Connection failed: ' + response.error, 'error');
        this.updateConnectionStatus(false, 'Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showMessage('❌ Connection test failed', 'error');
      this.updateConnectionStatus(false, 'Connection failed');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  async checkConnection() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'health_check' });
      
      if (response.success) {
        this.updateConnectionStatus(true, 'Connected');
      } else {
        this.updateConnectionStatus(false, 'Not configured');
      }
    } catch (error) {
      this.updateConnectionStatus(false, 'Not configured');
    }
  }

  updateConnectionStatus(connected, message) {
    const statusElement = document.getElementById('connectionStatus');
    const iconElement = document.getElementById('statusIcon');
    const textElement = document.getElementById('statusText');

    if (connected) {
      statusElement.className = 'status connected';
      iconElement.textContent = '✅';
      textElement.textContent = message;
    } else {
      statusElement.className = 'status disconnected';
      iconElement.textContent = '❌';
      textElement.textContent = message;
    }
  }

  async capturePage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'capture_page'
      });
      
      window.close();
    } catch (error) {
      console.error('Failed to capture page:', error);
      this.showMessage('Failed to capture page', 'error');
    }
  }

  async captureSelection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'capture_selection'
      });
      
      window.close();
    } catch (error) {
      console.error('Failed to capture selection:', error);
      this.showMessage('Failed to capture selection', 'error');
    }
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      ${type === 'success' 
        ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
        : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;

    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});