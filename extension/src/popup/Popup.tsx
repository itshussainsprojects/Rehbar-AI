import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Settings, User, Briefcase, Play, Square, AlertCircle } from 'lucide-react'
import type { ExtensionSettings, StorageData } from '../types'
import '../styles/globals.css'

interface PopupState {
  isListening: boolean
  settings: ExtensionSettings
  hasApiKey: boolean
  hasContextData: boolean
  currentTab: string
  usage: { sessions: number; tokens: number }
}

function Popup() {
  const [state, setState] = useState<PopupState>({
    isListening: false,
    settings: {
      mode: 'interview',
      answerLen: 80,
      ttsVoice: 'default',
      autoType: false
    },
    hasApiKey: false,
    hasContextData: false,
    currentTab: '',
    usage: { sessions: 0, tokens: 0 }
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadState()
    getCurrentTab()
  }, [])

  const loadState = async () => {
    try {
      const data = await chrome.storage.local.get(['settings', 'geminiKey', 'resumeText', 'productSheet', 'usage'])
      
      setState(prev => ({
        ...prev,
        settings: data.settings || prev.settings,
        hasApiKey: !!data.geminiKey,
        hasContextData: !!(data.resumeText || data.productSheet),
        usage: data.usage || { sessions: 0, tokens: 0 }
      }))
    } catch (err) {
      setError('Failed to load settings')
    }
  }

  const getCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const url = tab.url || ''
      
      let tabType = 'other'
      if (url.includes('meet.google.com')) tabType = 'Google Meet'
      else if (url.includes('zoom.us')) tabType = 'Zoom'
      else if (url.includes('teams.microsoft.com')) tabType = 'Teams'
      
      setState(prev => ({ ...prev, currentTab: tabType }))
    } catch (err) {
      console.error('Failed to get current tab:', err)
    }
  }

  const toggleListening = async () => {
    if (!state.hasApiKey || !state.hasContextData) {
      setError('Please configure API key and upload resume/product data in settings')
      return
    }

    try {
      if (state.isListening) {
        await chrome.runtime.sendMessage({ type: 'STOP_LISTENING' })
        setState(prev => ({ ...prev, isListening: false }))
      } else {
        await chrome.runtime.sendMessage({ type: 'START_LISTENING' })
        setState(prev => ({ ...prev, isListening: true }))
      }
      setError(null)
    } catch (err) {
      setError('Failed to toggle listening')
    }
  }

  const toggleMode = async () => {
    const newMode = state.settings.mode === 'interview' ? 'sales' : 'interview'
    const newSettings = { ...state.settings, mode: newMode }
    
    await chrome.storage.local.set({ settings: newSettings })
    setState(prev => ({ ...prev, settings: newSettings }))
  }

  const openOptions = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/Options.html') })
  }

  const isOnSupportedSite = state.currentTab !== 'other'

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold">Rehbar AI</h1>
          </div>
          <button
            onClick={openOptions}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Current page:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            isOnSupportedSite ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
          }`}>
            {state.currentTab}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Mode:</span>
          <button
            onClick={toggleMode}
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            {state.settings.mode === 'interview' ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
            <span className="text-sm capitalize">{state.settings.mode}</span>
          </button>
        </div>
      </div>

      {/* Main Control */}
      <div className="p-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleListening}
          disabled={!state.hasApiKey || !state.hasContextData}
          className={`w-full h-24 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${
            state.isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
          } ${(!state.hasApiKey || !state.hasContextData) ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {state.isListening ? (
            <>
              <Square className="w-6 h-6" />
              <span className="text-sm font-medium">Stop Listening</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span className="text-sm font-medium">Start Listening</span>
            </>
          )}
        </motion.button>

        {state.isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-sm text-white/70">Listening for speech...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Setup Status */}
      <div className="p-4 border-t border-white/10">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">API Key</span>
            <div className={`w-2 h-2 rounded-full ${state.hasApiKey ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">
              {state.settings.mode === 'interview' ? 'Resume' : 'Product Data'}
            </span>
            <div className={`w-2 h-2 rounded-full ${state.hasContextData ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/60">
            <span>Sessions: {state.usage.sessions}</span>
            <span>Tokens: {state.usage.tokens}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Initialize React app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}
