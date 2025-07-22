import React, { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PrimaryButton } from '../components/PrimaryButton'
import { Chrome, Monitor, Smartphone, Lock, ArrowRight, CheckCircle } from 'lucide-react'

export default function Download() {
  const [showRedirect, setShowRedirect] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      // Show redirect message for a moment, then redirect to signup
      setTimeout(() => {
        setShowRedirect(true)
      }, 2000)
    }
  }, [])

  if (showRedirect) {
    return <Navigate to="/signup" replace />
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token')
  if (token) {
    // User is authenticated, show download portal
    return <DownloadPortal />
  }

  // Show authentication required message
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center max-w-md mx-auto px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-satoshi font-bold text-white mb-4">
          Sign Up Required
        </h1>

        <p className="text-white/70 mb-8">
          To download Rehbar AI and access all features, please create your free account first. 
          Choose your plan and get instant access to downloads!
        </p>

        <div className="space-y-4">
          <Link to="/signup">
            <PrimaryButton className="w-full">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </Link>
          
          <Link to="/login">
            <button className="w-full py-3 px-4 text-white/80 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300">
              Already have an account? Sign In
            </button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-center space-x-2 text-sm text-white/60 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>3-Day Free Trial</span>
          </div>
          <p className="text-xs text-white/50">
            No credit card required • Cancel anytime
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// Download Portal for authenticated users
function DownloadPortal() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-16"
    >
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-satoshi font-black text-white mb-6">
              Download{' '}
              <span className="text-gradient-blue">Rehbar AI</span>
            </h1>

            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Choose your preferred platform and start using Rehbar AI's powerful meeting copilot features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Chrome Extension */}
              <motion.div
                className="glass-card p-8 text-center hover:bg-white/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Chrome className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-satoshi font-bold text-white mb-4">
                  Chrome Extension
                </h3>

                <p className="text-white/70 mb-6">
                  Meeting copilot for Google Meet, Zoom, Teams. Real-time AI suggestions during calls.
                </p>

                <div className="space-y-3">
                  <PrimaryButton 
                    className="w-full"
                    onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                  >
                    Install from Chrome Store
                  </PrimaryButton>
                  
                  <button 
                    className="w-full py-2 px-4 text-white/60 hover:text-white text-sm border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300"
                    onClick={() => {
                      // Create download link for local extension
                      const link = document.createElement('a')
                      link.href = '/chrome-extension.zip'
                      link.download = 'rehbar-ai-extension.zip'
                      link.click()
                    }}
                  >
                    Download Local Version
                  </button>
                </div>

                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-200 text-sm">
                    ✅ Recommended for meetings
                  </p>
                </div>
              </motion.div>

              {/* Desktop App */}
              <motion.div
                className="glass-card p-8 text-center hover:bg-white/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-satoshi font-bold text-white mb-4">
                  Desktop App
                </h3>

                <p className="text-white/70 mb-6">
                  Full-featured app with offline mode, local AI processing, and advanced features.
                </p>

                <div className="space-y-3">
                  <PrimaryButton 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Detect OS and download appropriate version
                      const userAgent = navigator.userAgent
                      let downloadUrl = '/desktop-app'
                      
                      if (userAgent.includes('Windows')) {
                        downloadUrl = '/rehbar-ai-windows.exe'
                      } else if (userAgent.includes('Mac')) {
                        downloadUrl = '/rehbar-ai-mac.dmg'
                      } else if (userAgent.includes('Linux')) {
                        downloadUrl = '/rehbar-ai-linux.AppImage'
                      }
                      
                      const link = document.createElement('a')
                      link.href = downloadUrl
                      link.download = 'rehbar-ai-desktop'
                      link.click()
                    }}
                  >
                    Download for Desktop
                  </PrimaryButton>
                  
                  <div className="flex space-x-2 text-xs">
                    <button className="flex-1 py-1 px-2 text-white/60 hover:text-white border border-white/20 rounded hover:bg-white/10 transition-all duration-300">
                      Windows
                    </button>
                    <button className="flex-1 py-1 px-2 text-white/60 hover:text-white border border-white/20 rounded hover:bg-white/10 transition-all duration-300">
                      macOS
                    </button>
                    <button className="flex-1 py-1 px-2 text-white/60 hover:text-white border border-white/20 rounded hover:bg-white/10 transition-all duration-300">
                      Linux
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    🚀 Coming Soon
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Installation Instructions */}
            <motion.div
              className="mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-satoshi font-bold text-white mb-8">
                Installation Instructions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Chrome className="w-5 h-5 mr-2" />
                    Chrome Extension
                  </h3>
                  <ol className="text-white/70 text-sm space-y-2">
                    <li>1. Click "Install from Chrome Store" above</li>
                    <li>2. Click "Add to Chrome" in the store</li>
                    <li>3. Pin the extension to your toolbar</li>
                    <li>4. Join any meeting and click the extension icon</li>
                    <li>5. Start using AI meeting copilot features!</li>
                  </ol>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Local Extension
                  </h3>
                  <ol className="text-white/70 text-sm space-y-2">
                    <li>1. Download the local version ZIP file</li>
                    <li>2. Extract the ZIP file to a folder</li>
                    <li>3. Open Chrome → Extensions → Developer mode</li>
                    <li>4. Click "Load unpacked" and select the folder</li>
                    <li>5. The extension will appear in your toolbar</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
