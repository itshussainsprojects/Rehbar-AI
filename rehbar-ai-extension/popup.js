// Popup Script for Rehbar AI Extension

class PopupController {
  constructor() {
    this.isListening = false;
    this.currentMode = 'interview';
    this.setupData = {
      hasApiKey: false,
      hasContext: false
    };
    
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadState();
    this.detectPlatform();
    this.updateUI();
  }

  bindEvents() {
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });

    // Options button
    document.getElementById('optionsBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });

    // Mode selector
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
        this.saveMode();
        this.updateContextLabel();
        this.checkSetupStatus();
      });
    });

    // Show chat button
    document.getElementById('showChatBtn').addEventListener('click', () => {
      this.showChatInterface();
    });

    // Listen for background script messages
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'ERROR') {
        this.showError(message.message);
      }
    });
  }

  async loadState() {
    try {
      // Load stored data
      const data = await chrome.storage.local.get([
        'geminiApiKey',
        'resumeText',
        'productSheet',
        'settings',
        'usage'
      ]);

      console.log('Loaded data:', {
        hasApiKey: !!(data.geminiApiKey && data.geminiApiKey.trim()),
        hasResume: !!(data.resumeText && data.resumeText.trim()),
        hasProductSheet: !!(data.productSheet && data.productSheet.trim()),
        settings: data.settings
      });

      // Update mode
      this.currentMode = data.settings?.mode || 'interview';
      document.getElementById(`${this.currentMode}Mode`).checked = true;

      // Check setup status
      this.setupData.hasApiKey = !!(data.geminiApiKey && data.geminiApiKey.trim());

      const contextData = this.currentMode === 'interview' ? data.resumeText : data.productSheet;
      this.setupData.hasContext = !!(contextData && contextData.trim());

      console.log('Setup status:', this.setupData);

      // Update usage stats
      const usage = data.usage || { sessionsCount: 0, totalTokensUsed: 0 };
      document.getElementById('sessionCount').textContent = usage.sessionsCount;
      document.getElementById('tokenCount').textContent = usage.totalTokensUsed;

      // Get listening status from background
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      this.isListening = response?.isListening || false;

    } catch (error) {
      console.error('Failed to load state:', error);
      this.showError('Failed to load extension state');
    }
  }

  async saveMode() {
    try {
      const data = await chrome.storage.local.get(['settings']);
      const settings = data.settings || {};
      settings.mode = this.currentMode;
      await chrome.storage.local.set({ settings });
    } catch (error) {
      console.error('Failed to save mode:', error);
    }
  }

  detectPlatform() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url) {
        document.getElementById('platformStatus').textContent = 'Unknown';
        return;
      }

      let platform = 'Other';
      if (tab.url.includes('meet.google.com')) {
        platform = 'Google Meet';
      } else if (tab.url.includes('zoom.us')) {
        platform = 'Zoom';
      } else if (tab.url.includes('teams.microsoft.com')) {
        platform = 'Teams';
      }

      document.getElementById('platformStatus').textContent = platform;
      
      // Enable/disable toggle based on platform support
      const isSupported = platform !== 'Other';
      const toggleBtn = document.getElementById('toggleBtn');
      
      if (!isSupported) {
        toggleBtn.disabled = true;
        this.showError('This platform is not supported. Please use Google Meet, Zoom, or Teams.');
      } else if (!this.setupData.hasApiKey || !this.setupData.hasContext) {
        toggleBtn.disabled = true;
      } else {
        toggleBtn.disabled = false;
        this.hideError();
      }
    });
  }

  updateContextLabel() {
    const label = this.currentMode === 'interview' ? 'Resume' : 'Product Sheet';
    document.getElementById('contextLabel').textContent = label;
  }

  checkSetupStatus() {
    // Update API key status
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    apiKeyStatus.className = `status-dot ${this.setupData.hasApiKey ? 'status-success' : 'status-error'}`;

    // Update context status
    const contextStatus = document.getElementById('contextStatus');
    contextStatus.className = `status-dot ${this.setupData.hasContext ? 'status-success' : 'status-error'}`;

    // Update toggle button state
    const toggleBtn = document.getElementById('toggleBtn');
    const canStart = this.setupData.hasApiKey && this.setupData.hasContext;
    
    if (!canStart && !this.isListening) {
      toggleBtn.disabled = true;
      if (!this.setupData.hasApiKey) {
        this.showError('Please configure your API key in settings');
      } else if (!this.setupData.hasContext) {
        const contextType = this.currentMode === 'interview' ? 'resume' : 'product sheet';
        this.showError(`Please upload your ${contextType} in settings`);
      }
    } else {
      toggleBtn.disabled = false;
      this.hideError();
    }
  }

  updateUI() {
    this.updateContextLabel();
    this.checkSetupStatus();

    // Update show chat button based on setup
    const showChatBtn = document.getElementById('showChatBtn');
    const isSetupComplete = this.setupData.hasApiKey && this.setupData.hasContext;

    if (isSetupComplete) {
      showChatBtn.disabled = false;
      showChatBtn.style.opacity = '1';
    } else {
      showChatBtn.disabled = true;
      showChatBtn.style.opacity = '0.6';
    }
  }

  async toggleListening() {
    try {
      if (this.isListening) {
        await chrome.runtime.sendMessage({ type: 'STOP_LISTENING' });
        this.isListening = false;
      } else {
        await chrome.runtime.sendMessage({ type: 'START_LISTENING' });
        this.isListening = true;
      }
      
      this.updateUI();
    } catch (error) {
      console.error('Failed to toggle listening:', error);
      this.showError('Failed to toggle listening state');
    }
  }

  showError(message) {
    const errorElement = document.getElementById('errorMessage');
    const errorText = errorElement.querySelector('.error-text');
    errorText.textContent = message;
    errorElement.classList.remove('hidden');
  }

  hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
  }

  async showChatInterface() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        this.showError('No active tab found. Please go to a meeting site first.');
        return;
      }

      // Check if we're on a supported site
      const supportedSites = ['meet.google.com', 'zoom.us', 'zoom.com', 'teams.microsoft.com', 'teams.live.com'];
      const isSupported = supportedSites.some(site => tab.url.includes(site));

      if (!isSupported) {
        this.showError('Please go to Google Meet, Zoom, or Microsoft Teams first.');
        return;
      }

      // Show chat interface
      chrome.tabs.sendMessage(tab.id, {
        type: 'FORCE_SHOW_OVERLAY'
      }, (response) => {
        if (chrome.runtime.lastError) {
          this.showError('Extension not loaded on this page. Please refresh and try again.');
        } else {
          this.showError('Chat interface opened! Configure your settings and click "Start Listening".');
          // Close popup after showing chat
          setTimeout(() => window.close(), 2000);
        }
      });

    } catch (error) {
      console.error('Show chat interface failed:', error);
      this.showError('Failed to show chat interface: ' + error.message);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
