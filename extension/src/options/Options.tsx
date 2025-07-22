import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'framer-motion'
import { 
  Key, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Briefcase,
  User,
  Settings as SettingsIcon,
  Volume2
} from 'lucide-react'
import type { ExtensionSettings, StorageData } from '../types'
import { GeminiClient } from '../ai/geminiClient'
import '../styles/globals.css'

interface OptionsState {
  geminiKey: string
  resumeText: string
  productSheet: string
  settings: ExtensionSettings
  isTestingKey: boolean
  keyValid: boolean | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  error: string | null
}

function Options() {
  const [state, setState] = useState<OptionsState>({
    geminiKey: '',
    resumeText: '',
    productSheet: '',
    settings: {
      mode: 'interview',
      answerLen: 80,
      ttsVoice: 'default',
      autoType: false
    },
    isTestingKey: false,
    keyValid: null,
    saveStatus: 'idle',
    error: null
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await chrome.storage.local.get(['geminiKey', 'resumeText', 'productSheet', 'settings'])
      
      setState(prev => ({
        ...prev,
        geminiKey: data.geminiKey || '',
        resumeText: data.resumeText || '',
        productSheet: data.productSheet || '',
        settings: data.settings || prev.settings
      }))
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to load settings' }))
    }
  }

  const testApiKey = async () => {
    if (!state.geminiKey.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter an API key' }))
      return
    }

    setState(prev => ({ ...prev, isTestingKey: true, error: null }))

    try {
      const client = new GeminiClient(state.geminiKey)
      const isValid = await client.testConnection()
      
      setState(prev => ({ 
        ...prev, 
        isTestingKey: false, 
        keyValid: isValid,
        error: isValid ? null : 'Invalid API key or connection failed'
      }))
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isTestingKey: false, 
        keyValid: false,
        error: 'Failed to test API key'
      }))
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'product') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      
      if (type === 'resume') {
        setState(prev => ({ ...prev, resumeText: text }))
      } else {
        setState(prev => ({ ...prev, productSheet: text }))
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to read file' }))
    }
  }

  const saveSettings = async () => {
    setState(prev => ({ ...prev, saveStatus: 'saving', error: null }))

    try {
      const dataToSave: Partial<StorageData> = {
        geminiKey: state.geminiKey,
        resumeText: state.resumeText,
        productSheet: state.productSheet,
        settings: state.settings
      }

      await chrome.storage.local.set(dataToSave)
      
      setState(prev => ({ ...prev, saveStatus: 'saved' }))
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }))
      }, 2000)
      
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        saveStatus: 'error',
        error: 'Failed to save settings'
      }))
    }
  }

  const updateSettings = (updates: Partial<ExtensionSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Rehbar AI Settings</h1>
          </div>
          <p className="text-white/70 text-lg">Configure your AI assistant for interviews and sales</p>
        </motion.div>

        {/* Error Display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{state.error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">API Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Google Gemini API Key
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={state.geminiKey}
                    onChange={(e) => setState(prev => ({ ...prev, geminiKey: e.target.value, keyValid: null }))}
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={testApiKey}
                    disabled={state.isTestingKey}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {state.isTestingKey ? 'Testing...' : 'Test'}
                  </button>
                </div>
                
                {state.keyValid !== null && (
                  <div className={`mt-2 flex items-center space-x-2 text-sm ${
                    state.keyValid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {state.keyValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{state.keyValid ? 'API key is valid' : 'API key is invalid'}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg">
                <p className="mb-1">🔑 Get your free API key from:</p>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  https://makersuite.google.com/app/apikey
                </a>
              </div>
            </div>
          </motion.div>

          {/* Mode Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SettingsIcon className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold">Assistant Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Default Mode
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateSettings({ mode: 'interview' })}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      state.settings.mode === 'interview'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Interview</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ mode: 'sales' })}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      state.settings.mode === 'sales'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Sales</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Response Length (words): {state.settings.answerLen}
                </label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={state.settings.answerLen}
                  onChange={(e) => updateSettings({ answerLen: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Concise (30)</span>
                  <span>Detailed (150)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Auto-type suggestions</label>
                <button
                  onClick={() => updateSettings({ autoType: !state.settings.autoType })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.settings.autoType ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.settings.autoType ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold">Content Upload</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Resume / CV (for Interview Mode)
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-colors">
                <FileText className="w-8 h-8 text-white/60 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'resume')}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <span className="text-sm text-white/70">
                    {state.resumeText ? 'Resume uploaded ✓' : 'Click to upload resume'}
                  </span>
                </label>
              </div>
              {state.resumeText && (
                <div className="mt-2 text-xs text-white/60">
                  {state.resumeText.length} characters loaded
                </div>
              )}
            </div>

            {/* Product Sheet Upload */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Product Sheet (for Sales Mode)
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-colors">
                <Briefcase className="w-8 h-8 text-white/60 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'product')}
                  className="hidden"
                  id="product-upload"
                />
                <label htmlFor="product-upload" className="cursor-pointer">
                  <span className="text-sm text-white/70">
                    {state.productSheet ? 'Product sheet uploaded ✓' : 'Click to upload product info'}
                  </span>
                </label>
              </div>
              {state.productSheet && (
                <div className="mt-2 text-xs text-white/60">
                  {state.productSheet.length} characters loaded
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={saveSettings}
            disabled={state.saveStatus === 'saving'}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
              state.saveStatus === 'saved'
                ? 'bg-green-500 text-white'
                : state.saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            } ${state.saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center space-x-2">
              {state.saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {state.saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
              {state.saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
              {state.saveStatus === 'idle' && <Save className="w-4 h-4" />}
              <span>
                {state.saveStatus === 'saving' && 'Saving...'}
                {state.saveStatus === 'saved' && 'Saved Successfully!'}
                {state.saveStatus === 'error' && 'Save Failed'}
                {state.saveStatus === 'idle' && 'Save Settings'}
              </span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// Initialize React app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Options />)
}
