import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import { detectOS, getOSDisplayName, getDownloadFileName } from '../utils/osDetect'
import { 
  Monitor, 
  Download, 
  Wifi, 
  Shield, 
  RefreshCw,
  Chrome,
  ArrowRight,
  CheckCircle,
  Hash
} from 'lucide-react'

export default function Desktop() {
  const [selectedOS, setSelectedOS] = useState(() => {
    const detected = detectOS()
    return detected.name.toLowerCase().includes('windows') ? 'windows' :
           detected.name.toLowerCase().includes('mac') ? 'macos' : 'linux'
  })

  const osOptions = [
    { id: 'windows', name: 'Windows', icon: '🪟' },
    { id: 'macos', name: 'macOS', icon: '🍎' },
    { id: 'linux', name: 'Linux', icon: '🐧' }
  ]

  const features = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Offline Mode",
      description: "Full functionality without internet connection using local AI models"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Local Whisper",
      description: "Voice processing happens entirely on your device for maximum privacy"
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Auto-Update",
      description: "Seamless updates with new features and improvements delivered automatically"
    }
  ]

  const systemRequirements = {
    windows: {
      minimum: ["Windows 10 64-bit", "4GB RAM", "2GB storage", "Microphone"],
      recommended: ["Windows 11", "8GB RAM", "4GB storage", "Quality microphone"]
    },
    macos: {
      minimum: ["macOS 11.0", "4GB RAM", "2GB storage", "Microphone"],
      recommended: ["macOS 13.0+", "8GB RAM", "4GB storage", "Quality microphone"]
    },
    linux: {
      minimum: ["Ubuntu 20.04+", "4GB RAM", "2GB storage", "Microphone"],
      recommended: ["Ubuntu 22.04+", "8GB RAM", "4GB storage", "Quality microphone"]
    }
  }

  const downloadUrl = `https://releases.rehbar-ai.com/${getDownloadFileName(selectedOS)}`
  const sha256Hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-16"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <Monitor className="w-12 h-12 text-gradient-blue mr-4" />
                <span className="text-2xl font-satoshi font-bold text-white">Desktop App</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-satoshi font-black text-white mb-6">
                Powerful AI on Your{' '}
                <span className="text-gradient-blue">Desktop</span>
              </h1>
              
              <p className="text-xl text-white/70 mb-8">
                Full-featured desktop application with offline capabilities, local AI processing, 
                and seamless integration with your workflow.
              </p>
              
              {/* OS Selection */}
              <div className="mb-8">
                <p className="text-white/80 mb-4">Choose your operating system:</p>
                <div className="flex flex-wrap gap-3">
                  {osOptions.map((os) => (
                    <button
                      key={os.id}
                      onClick={() => setSelectedOS(os.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedOS === os.id
                          ? 'bg-gradient-blue text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-2">{os.icon}</span>
                      {os.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <PrimaryButton 
                  size="lg" 
                  href={downloadUrl}
                  className="group"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for {getOSDisplayName(selectedOS)}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </PrimaryButton>
                
                <Link to="/extension">
                  <PrimaryButton variant="outline" size="lg">
                    <Chrome className="w-5 h-5 mr-2" />
                    Try Browser Extension
                  </PrimaryButton>
                </Link>
              </div>
              
              {/* SHA256 Hash */}
              <motion.div
                className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center text-sm text-white/60">
                  <Hash className="w-4 h-4 mr-2" />
                  <span className="font-jetbrains">SHA256: {sha256Hash}</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <motion.div 
                  className="w-full h-96 bg-gradient-to-br from-gradient-blue-a/20 to-electric-violet/20 rounded-2xl glass-card p-8"
                  animate={{ 
                    rotateY: [0, 5, 0],
                    rotateX: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-white/60 text-sm ml-2">Rehbar AI Desktop</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-blue rounded-full flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-black" />
                        </div>
                        <div className="h-2 bg-white/30 rounded flex-1"></div>
                      </div>
                      <div className="h-2 bg-white/20 rounded w-3/4"></div>
                      <div className="h-2 bg-gradient-blue rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-white/80">Desktop Preview</p>
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-blue rounded-2xl blur-2xl opacity-20 -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Desktop Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need for professional AI assistance on your desktop
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="h-full">
                  <div className="text-gradient-blue mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/80">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-satoshi font-bold text-white mb-4">
              System Requirements
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Make sure your system meets these requirements for optimal performance
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard>
                <h3 className="text-2xl font-satoshi font-bold text-white mb-6">
                  Minimum Requirements
                </h3>
                <div className="space-y-3">
                  {systemRequirements[selectedOS as keyof typeof systemRequirements].minimum.map((req, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                      <span className="text-white/80">{req}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard>
                <h3 className="text-2xl font-satoshi font-bold text-white mb-6">
                  Recommended
                </h3>
                <div className="space-y-3">
                  {systemRequirements[selectedOS as keyof typeof systemRequirements].recommended.map((req, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-white/80">{req}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-6">
              Ready for Desktop Power?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Download Rehbar AI and experience the full potential of desktop AI
            </p>
            <PrimaryButton
              size="lg"
              href={downloadUrl}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Download className="w-5 h-5 mr-2" />
              Download for {getOSDisplayName(selectedOS)}
            </PrimaryButton>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
