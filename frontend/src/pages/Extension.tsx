import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import { 
  Chrome, 
  Download, 
  Zap, 
  Shield, 
  Keyboard,
  Monitor,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Extension() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Access",
      description: "Quick popup interface accessible from any webpage with Ctrl+Shift+R"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "All processing happens locally. No data sent to external servers."
    },
    {
      icon: <Keyboard className="w-8 h-8" />,
      title: "Auto-Type Feature",
      description: "AI suggestions can be automatically typed into any text field"
    }
  ]

  const installSteps = [
    {
      step: 1,
      title: "Click Install",
      description: "Click the button below to open Chrome Web Store"
    },
    {
      step: 2,
      title: "Add Extension",
      description: "Click 'Add to Chrome' and confirm the installation"
    },
    {
      step: 3,
      title: "Start Using",
      description: "Press Ctrl+Shift+R on any page to activate Rehbar AI"
    }
  ]

  const permissions = [
    {
      permission: "Active Tab",
      reason: "To interact with the current webpage and insert AI suggestions"
    },
    {
      permission: "Storage",
      reason: "To save your preferences and conversation history locally"
    },
    {
      permission: "Microphone",
      reason: "To capture voice input for AI processing"
    }
  ]

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
                <Chrome className="w-12 h-12 text-gradient-blue mr-4" />
                <span className="text-2xl font-satoshi font-bold text-white">Chrome Extension</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-satoshi font-black text-white mb-6">
                AI Assistant in Your{' '}
                <span className="text-gradient-blue">Browser</span>
              </h1>
              
              <p className="text-xl text-white/70 mb-8">
                Transform any webpage into an AI-powered workspace. Get instant suggestions, 
                voice transcription, and smart responses without leaving your browser.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <PrimaryButton 
                  size="lg" 
                  href="https://chrome.google.com/webstore"
                  className="group"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Install from Web Store
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </PrimaryButton>
                
                <Link to="/desktop">
                  <PrimaryButton variant="outline" size="lg">
                    <Monitor className="w-5 h-5 mr-2" />
                    Need Desktop App?
                  </PrimaryButton>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-gradient-blue-a/20 to-electric-violet/20 rounded-2xl glass-card p-8">
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-white/60 text-sm ml-2">Rehbar AI Extension</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded w-3/4"></div>
                      <div className="h-2 bg-white/20 rounded w-1/2"></div>
                      <div className="h-2 bg-gradient-blue rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                      <Chrome className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-white/80">Extension Preview</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-blue rounded-2xl blur-2xl opacity-20 -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-20 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Install in 3 Simple Steps
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get up and running with Rehbar AI in less than a minute
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {installSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto text-black font-bold text-xl">
                    {step.step}
                  </div>
                  {index < installSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-blue/30"></div>
                  )}
                </div>
                <h3 className="text-xl font-satoshi font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Extension Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Powerful AI capabilities integrated seamlessly into your browser
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

      {/* Permissions */}
      <section className="py-20 bg-primary-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-satoshi font-bold text-white mb-4">
              Permissions & Privacy
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              We only request the minimum permissions needed for functionality
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {permissions.map((item, index) => (
              <motion.div
                key={item.permission}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.permission}
                    </h3>
                    <p className="text-white/70">
                      {item.reason}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
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
              Ready to Supercharge Your Browser?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Install Rehbar AI and transform every webpage into an AI workspace
            </p>
            <PrimaryButton
              size="lg"
              href="https://chrome.google.com/webstore"
              className="bg-white text-black hover:bg-gray-100"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Install Chrome Extension
            </PrimaryButton>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
