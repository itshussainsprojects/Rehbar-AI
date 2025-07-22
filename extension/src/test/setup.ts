import { vi } from 'vitest'

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    sendMessage: vi.fn(),
    getURL: vi.fn((path: string) => `chrome-extension://test/${path}`)
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined)
    }
  },
  tabs: {
    query: vi.fn().mockResolvedValue([{ id: 1, url: 'https://meet.google.com/test' }]),
    create: vi.fn(),
    sendMessage: vi.fn()
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: true }]),
    insertCSS: vi.fn().mockResolvedValue(undefined)
  }
}

// @ts-ignore
global.chrome = mockChrome

// Mock Web APIs
global.navigator = {
  ...global.navigator,
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  },
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream())
  }
}

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = true
  interimResults = true
  lang = 'en-US'
  maxAlternatives = 1
  
  onstart = vi.fn()
  onend = vi.fn()
  onerror = vi.fn()
  onresult = vi.fn()
  
  start = vi.fn()
  stop = vi.fn()
}

global.SpeechRecognition = MockSpeechRecognition
global.webkitSpeechRecognition = MockSpeechRecognition

// Mock speechSynthesis
global.speechSynthesis = {
  speak: vi.fn(),
  getVoices: vi.fn().mockReturnValue([])
} as any

// Mock fetch for Gemini API
global.fetch = vi.fn()

// Mock document methods
Object.defineProperty(document, 'execCommand', {
  value: vi.fn().mockReturnValue(true)
})

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  value: vi.fn().mockReturnValue({
    rangeCount: 0,
    removeAllRanges: vi.fn(),
    addRange: vi.fn()
  })
})
