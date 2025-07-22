export interface ExtensionSettings {
  mode: 'interview' | 'sales'
  answerLen: number
  ttsVoice: string
  autoType: boolean
}

export interface StorageData {
  geminiKey?: string
  resumeText?: string
  productSheet?: string
  settings: ExtensionSettings
  usage: {
    sessions: number
    tokens: number
  }
}

export interface AISuggestion {
  id: string
  text: string
  confidence: number
  type: 'answer' | 'question' | 'tip'
}

export interface TranscriptChunk {
  text: string
  isFinal: boolean
  timestamp: number
}

export interface ServiceWorkerMessage {
  type: 'START_LISTENING' | 'STOP_LISTENING' | 'INJECT_OVERLAY' | 'REMOVE_OVERLAY'
  data?: any
}

export interface ContentMessage {
  type: 'TRANSCRIPT_UPDATE' | 'AI_SUGGESTION' | 'STATUS_UPDATE'
  data: any
}

export interface GeminiResponse {
  suggestions: AISuggestion[]
  tokensUsed: number
}

export interface SpeechRecognitionResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface WhisperConfig {
  modelPath: string
  language: 'en'
  task: 'transcribe'
}

// Import Chrome extension types
/// <reference types="chrome" />
/// <reference path="./types/chrome.d.ts" />

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition
    SpeechRecognition: typeof SpeechRecognition
    speechSynthesis: SpeechSynthesis
  }
}
