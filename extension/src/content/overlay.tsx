import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Copy, 
  Type, 
  Volume2, 
  Mic, 
  MicOff, 
  X, 
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { AISuggestion, TranscriptChunk, ExtensionSettings, ContentMessage } from '../types'
import { useWebSpeech } from '../stt/useWebSpeech'
import { GeminiClient } from '../ai/geminiClient'
import { autoType } from '../utils/autoType'
import '../styles/globals.css'

interface OverlayState {
  isVisible: boolean
  isMinimized: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  suggestions: AISuggestion[]
  settings: ExtensionSettings
  geminiKey: string
  contextData: string
  isProcessing: boolean
  error: string | null
}

function Overlay() {
  const [state, setState] = useState<OverlayState>({
    isVisible: false,
    isMinimized: false,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    suggestions: [],
    settings: {
      mode: 'interview',
      answerLen: 80,
      ttsVoice: 'default',
      autoType: false
    },
    geminiKey: '',
    contextData: '',
    isProcessing: false,
    error: null
  })

  const geminiClientRef = useRef<GeminiClient | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition
  const { 
    isListening: speechListening, 
    startListening, 
    stopListening,
    isSupported: speechSupported,
    error: speechError
  } = useWebSpeech({
    continuous: true,
    interimResults: true,
    onResult: handleSpeechResult,
    onError: (error) => setState(prev => ({ ...prev, error }))
  })

  useEffect(() => {
    loadSettings()
    setupMessageListener()
    
    return () => {
      stopListening()
    }
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, isListening: speechListening }))
  }, [speechListening])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [state.transcript, state.interimTranscript])

  const loadSettings = async () => {
    try {
      const data = await chrome.storage.local.get(['settings', 'geminiKey', 'resumeText', 'productSheet'])
      
      const contextData = data.settings?.mode === 'interview' 
        ? data.resumeText || ''
        : data.productSheet || ''

      setState(prev => ({
        ...prev,
        settings: data.settings || prev.settings,
        geminiKey: data.geminiKey || '',
        contextData
      }))

      if (data.geminiKey) {
        geminiClientRef.current = new GeminiClient(data.geminiKey)
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to load settings' }))
    }
  }

  const setupMessageListener = () => {
    chrome.runtime.onMessage.addListener((message: ContentMessage) => {
      switch (message.type) {
        case 'START_LISTENING':
          handleStartListening()
          break
        case 'STOP_LISTENING':
          handleStopListening()
          break
      }
    })
  }

  const handleStartListening = () => {
    setState(prev => ({ 
      ...prev, 
      isVisible: true, 
      isMinimized: false,
      transcript: '',
      interimTranscript: '',
      suggestions: [],
      error: null
    }))
    
    if (speechSupported) {
      startListening()
    } else {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }))
    }
  }

  const handleStopListening = () => {
    stopListening()
    setState(prev => ({ 
      ...prev, 
      isVisible: false,
      isListening: false
    }))
  }

  async function handleSpeechResult(result: any) {
    if (result.isFinal) {
      const newTranscript = result.text.trim()
      if (newTranscript.length > 0) {
        setState(prev => ({ 
          ...prev, 
          transcript: prev.transcript + newTranscript + ' ',
          interimTranscript: ''
        }))
        
        // Generate AI suggestions
        await generateSuggestions(newTranscript)
      }
    } else {
      setState(prev => ({ ...prev, interimTranscript: result.text }))
    }
  }

  const generateSuggestions = async (transcript: string) => {
    if (!geminiClientRef.current || !state.contextData) return

    setState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const response = await geminiClientRef.current.generateSuggestions(
        transcript,
        state.settings.mode,
        state.contextData,
        state.settings
      )

      setState(prev => ({
        ...prev,
        suggestions: response.suggestions,
        isProcessing: false
      }))

      // Update token usage
      const data = await chrome.storage.local.get(['usage'])
      const usage = data.usage || { sessions: 0, tokens: 0 }
      usage.tokens += response.tokensUsed
      await chrome.storage.local.set({ usage })

    } catch (err) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to generate suggestions'
      }))
    }
  }

  const copySuggestion = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show brief success feedback
      setState(prev => ({ ...prev, error: null }))
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to copy to clipboard' }))
    }
  }

  const typeSuggestion = async (text: string) => {
    try {
      await autoType(text)
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to auto-type text' }))
    }
  }

  const speakSuggestion = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = speechSynthesis.getVoices().find(voice =>
        voice.name.includes(state.settings.ttsVoice)
      ) || null
      speechSynthesis.speak(utterance)
    }
  }

  const toggleMinimize = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))
  }

  const closeOverlay = () => {
    handleStopListening()
  }

  if (!state.isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 320 }}
      animate={{
        opacity: 1,
        x: 0,
        width: state.isMinimized ? 60 : 320
      }}
      exit={{ opacity: 0, x: 320 }}
      className="fixed top-4 right-4 z-[10000] bg-glass backdrop-blur-md rounded-xl border border-white/20 shadow-2xl text-white font-sans"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxHeight: '80vh'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${state.isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          {!state.isMinimized && (
            <span className="text-sm font-medium">
              Rehbar AI - {state.settings.mode === 'interview' ? 'Interview' : 'Sales'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {state.isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={closeOverlay}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!state.isMinimized && (
        <>
          {/* Error Display */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-500/20 border-b border-red-500/30 flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-300">{state.error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              {state.isListening ? <Mic className="w-4 h-4 text-green-400" /> : <MicOff className="w-4 h-4 text-gray-400" />}
              <span className="text-xs text-white/70">Live Transcript</span>
            </div>

            <div
              ref={transcriptRef}
              className="max-h-24 overflow-y-auto text-sm text-white/90 bg-white/5 rounded-lg p-2"
              aria-live="polite"
            >
              {state.transcript && (
                <span className="text-white">{state.transcript}</span>
              )}
              {state.interimTranscript && (
                <span className="text-white/60 italic">{state.interimTranscript}</span>
              )}
              {!state.transcript && !state.interimTranscript && (
                <span className="text-white/50">Waiting for speech...</span>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/70">AI Suggestions</span>
              {state.isProcessing && (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {state.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.type === 'answer' ? 'bg-blue-500/20 text-blue-300' :
                        suggestion.type === 'question' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {suggestion.type}
                      </span>
                      <span className="text-xs text-white/50">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>

                    <p className="text-sm text-white/90 mb-3 leading-relaxed">
                      {suggestion.text}
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copySuggestion(suggestion.text)}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs text-blue-300 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => typeSuggestion(suggestion.text)}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-xs text-green-300 transition-colors"
                      >
                        <Type className="w-3 h-3" />
                        <span>Type</span>
                      </button>

                      <button
                        onClick={() => speakSuggestion(suggestion.text)}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-xs text-purple-300 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!state.isProcessing && state.suggestions.length === 0 && state.transcript && (
                <div className="text-center py-4 text-white/50 text-sm">
                  No suggestions yet. Keep talking...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

// Initialize overlay
function initializeOverlay() {
  // Check if overlay already exists
  if (document.getElementById('rehbar-ai-overlay')) {
    return
  }

  // Create overlay container
  const overlayContainer = document.createElement('div')
  overlayContainer.id = 'rehbar-ai-overlay'
  overlayContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `

  // Make overlay interactive
  overlayContainer.addEventListener('mousedown', (e) => {
    e.stopPropagation()
  })
  overlayContainer.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  overlayContainer.style.pointerEvents = 'none'

  // Add to page
  document.body.appendChild(overlayContainer)

  // Create React root and render
  const root = createRoot(overlayContainer)
  root.render(
    <div style={{ pointerEvents: 'auto' }}>
      <Overlay />
    </div>
  )
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverlay)
} else {
  initializeOverlay()
}
