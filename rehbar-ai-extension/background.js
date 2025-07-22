// Service Worker for Rehbar AI Extension

// Extension state
let isListening = false;
let currentTabId = null;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize default storage
    const defaultData = {
      geminiApiKey: '',
      resumeText: '',
      productSheet: '',
      settings: {
        mode: 'interview',
        responseLength: 80,
        ttsVoice: 'default',
        typingSpeed: 50
      },
      usage: {
        sessionsCount: 0,
        totalTokensUsed: 0,
        lastUsed: null
      }
    };
    
    await chrome.storage.local.set(defaultData);
    
    // Open options page for first-time setup
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_LISTENING':
      handleStartListening(sender.tab?.id);
      break;

    case 'STOP_LISTENING':
      handleStopListening();
      break;

    case 'GET_STATUS':
      sendResponse({ isListening, currentTabId });
      break;

    case 'INJECT_OVERLAY':
      injectOverlay(sender.tab?.id);
      break;

    case 'FORCE_INJECT':
      handleForceInject(message.tabId);
      break;

    case 'UPDATE_USAGE':
      updateUsageStats(message.data);
      break;
  }

  return true; // Keep message channel open for async response
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    switch (command) {
      case 'toggle-chat':
        // Show/hide chat interface
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_CHAT_INTERFACE' });
        break;

      case 'toggle-listening':
        if (isListening) {
          handleStopListening();
        } else {
          handleStartListening(tab.id);
        }
        break;

      case 'toggle-overlay':
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
        break;
    }
  } catch (error) {
    console.error('Command handler error:', error);
  }
});

// Handle force injection from popup
async function handleForceInject(tabId) {
  try {
    console.log('Force injecting content script into tab:', tabId);
    await injectOverlayWithRetry(tabId, 5); // More retries for manual injection
    console.log('Force injection completed');
  } catch (error) {
    console.error('Force injection failed:', error);
  }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isListening && tabId === currentTabId) {
    // Re-inject overlay if page reloaded during listening
    setTimeout(() => injectOverlay(tabId), 1000);
  }
});

async function handleStartListening(tabId) {
  if (!tabId) return;

  try {
    // Check if we have required data
    const data = await chrome.storage.local.get(['geminiApiKey', 'resumeText', 'productSheet', 'settings']);

    console.log('Starting listening with data:', {
      hasApiKey: !!data.geminiApiKey,
      hasResume: !!data.resumeText,
      hasProductSheet: !!data.productSheet,
      mode: data.settings?.mode
    });

    if (!data.geminiApiKey) {
      throw new Error('API key not configured. Please add your Gemini API key in settings.');
    }

    const contextData = data.settings?.mode === 'interview' ? data.resumeText : data.productSheet;
    if (!contextData) {
      throw new Error(`${data.settings?.mode === 'interview' ? 'Resume' : 'Product sheet'} not uploaded. Please upload your ${data.settings?.mode === 'interview' ? 'resume' : 'product sheet'} in settings.`);
    }

    isListening = true;
    currentTabId = tabId;

    // Force inject overlay with retry
    await injectOverlayWithRetry(tabId);

    // Wait a moment for injection
    await new Promise(resolve => setTimeout(resolve, 500));

    // Notify content script to start listening
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'START_LISTENING',
        data: {
          settings: data.settings || { mode: 'interview', responseLength: 80, typingSpeed: 50 },
          contextData,
          apiKey: data.geminiApiKey
        }
      });
      console.log('Start listening message sent to content script');
    } catch (msgError) {
      console.error('Failed to send message to content script:', msgError);
      throw new Error('Failed to communicate with page. Please refresh and try again.');
    }

    // Update usage stats
    const usage = data.usage || { sessionsCount: 0, totalTokensUsed: 0, lastUsed: null };
    usage.sessionsCount++;
    usage.lastUsed = Date.now();
    await chrome.storage.local.set({ usage });

  } catch (error) {
    console.error('Failed to start listening:', error);
    isListening = false;
    currentTabId = null;

    // Notify popup of error
    chrome.runtime.sendMessage({
      type: 'ERROR',
      message: error.message
    }).catch(() => {
      // Ignore if popup is closed
    });
  }
}

async function handleStopListening() {
  isListening = false;
  
  if (currentTabId) {
    try {
      chrome.tabs.sendMessage(currentTabId, {
        type: 'STOP_LISTENING'
      });
    } catch (error) {
      console.error('Failed to notify content script:', error);
    }
  }
  
  currentTabId = null;
}

async function injectOverlayWithRetry(tabId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Injection attempt ${attempt}/${maxRetries} for tab ${tabId}`);

      // Check if content script is already loaded
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          return {
            hasOverlay: !!document.getElementById('rehbar-ai-overlay'),
            hasRehbarAI: !!window.rehbarAI,
            url: window.location.href,
            readyState: document.readyState
          };
        }
      });

      const status = results[0]?.result;
      console.log('Page status:', status);

      if (status?.hasRehbarAI && status?.hasOverlay) {
        console.log('Content script already loaded and working');
        return;
      }

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });

      // Inject styles
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content.css']
      });

      console.log('Content script and styles injected successfully');

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify injection worked
      const verifyResults = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => !!window.rehbarAI
      });

      if (verifyResults[0]?.result) {
        console.log('Content script injection verified');
        return;
      }

      if (attempt === maxRetries) {
        throw new Error('Content script failed to load after multiple attempts');
      }

    } catch (error) {
      console.error(`Injection attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to inject content script after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Legacy function for compatibility
async function injectOverlay(tabId) {
  return injectOverlayWithRetry(tabId);
}

async function updateUsageStats(data) {
  try {
    const stored = await chrome.storage.local.get(['usage']);
    const usage = stored.usage || { sessionsCount: 0, totalTokensUsed: 0, lastUsed: null };
    
    if (data.tokensUsed) {
      usage.totalTokensUsed += data.tokensUsed;
    }
    
    await chrome.storage.local.set({ usage });
  } catch (error) {
    console.error('Failed to update usage stats:', error);
  }
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) return;

  switch (command) {
    case 'toggle-listening':
      if (isListening) {
        handleStopListening();
      } else {
        handleStartListening(tab.id);
      }
      break;

    case 'toggle-overlay':
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_OVERLAY'
      });
      break;

    case 'quick-action':
      // This will copy by default, or type if Shift is held (handled in content script)
      chrome.tabs.sendMessage(tab.id, {
        type: 'QUICK_ACTION'
      });
      break;

    case 'switch-mode':
      await switchMode();
      break;
  }
});

// Switch between interview and sales mode
async function switchMode() {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || { mode: 'interview' };

    settings.mode = settings.mode === 'interview' ? 'sales' : 'interview';
    await chrome.storage.local.set({ settings });

    // Notify all tabs about mode change
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MODE_CHANGED',
          mode: settings.mode
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      }
    });

    // Show notification
    chrome.action.setBadgeText({
      text: settings.mode === 'interview' ? 'INT' : 'SAL'
    });
    chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });

    // Clear badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);

  } catch (error) {
    console.error('Failed to switch mode:', error);
  }
}

// Handle extension icon click when no popup is defined
chrome.action.onClicked.addListener((tab) => {
  // This won't fire since we have a popup, but keeping for completeness
  chrome.tabs.create({
    url: chrome.runtime.getURL('options.html')
  });
});
