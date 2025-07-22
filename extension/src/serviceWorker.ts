import type { ExtensionSettings, StorageData, ServiceWorkerMessage } from './types'

// Default settings
const DEFAULT_SETTINGS: ExtensionSettings = {
  mode: 'interview',
  answerLen: 80,
  ttsVoice: 'default',
  autoType: false
}

const DEFAULT_STORAGE: StorageData = {
  settings: DEFAULT_SETTINGS,
  usage: {
    sessions: 0,
    tokens: 0
  }
}

// Extension state
let isListening = false
let currentTabId: number | null = null

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize storage with defaults
    await chrome.storage.local.set(DEFAULT_STORAGE)
    
    // Open options page for first-time setup
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/options/Options.html')
    })
  }
})

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, sender, sendResponse) => {
  switch (message.type) {
    case 'START_LISTENING':
      handleStartListening(sender.tab?.id)
      break
    
    case 'STOP_LISTENING':
      handleStopListening()
      break
    
    case 'INJECT_OVERLAY':
      injectOverlay(sender.tab?.id)
      break
    
    case 'REMOVE_OVERLAY':
      removeOverlay(sender.tab?.id)
      break
  }
  
  sendResponse({ success: true })
  return true
})

// Handle tab updates to maintain overlay state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isListening && tabId === currentTabId) {
    // Re-inject overlay if page reloaded during listening
    injectOverlay(tabId)
  }
})

async function handleStartListening(tabId?: number) {
  if (!tabId) return
  
  isListening = true
  currentTabId = tabId
  
  // Inject overlay if not present
  await injectOverlay(tabId)
  
  // Increment session count
  const data = await chrome.storage.local.get(['usage'])
  const usage = data.usage || { sessions: 0, tokens: 0 }
  usage.sessions++
  await chrome.storage.local.set({ usage })
  
  // Notify content script to start listening
  chrome.tabs.sendMessage(tabId, {
    type: 'START_LISTENING'
  })
}

async function handleStopListening() {
  isListening = false
  
  if (currentTabId) {
    // Notify content script to stop listening
    chrome.tabs.sendMessage(currentTabId, {
      type: 'STOP_LISTENING'
    })
  }
  
  currentTabId = null
}

async function injectOverlay(tabId?: number) {
  if (!tabId) return
  
  try {
    // Check if overlay is already injected
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!document.getElementById('rehbar-ai-overlay')
    })
    
    if (results[0]?.result) {
      return // Overlay already exists
    }
    
    // Inject overlay content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/overlay.tsx']
    })
    
    // Inject styles
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['src/content/styles.css']
    })
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to inject overlay:', error)
    }
  }
}

async function removeOverlay(tabId?: number) {
  if (!tabId) return
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const overlay = document.getElementById('rehbar-ai-overlay')
        if (overlay) {
          overlay.remove()
        }
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to remove overlay:', error)
    }
  }
}

// Export for testing
export { handleStartListening, handleStopListening, injectOverlay }
