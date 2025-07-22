import React from 'react'
import { 
  Mic, 
  Brain, 
  Shield, 
  Zap, 
  Globe, 
  Smartphone,
  Cloud,
  Settings,
  MessageSquare,
  Calendar,
  Search,
  Music
} from 'lucide-react'

const Features = () => {
  const mainFeatures = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Advanced AI Intelligence",
      description: "Powered by state-of-the-art machine learning algorithms that understand context, intent, and nuance in human speech.",
      details: [
        "Natural language processing",
        "Context-aware responses",
        "Learning from interactions",
        "Multi-turn conversations"
      ]
    },
    {
      icon: <Mic className="w-12 h-12" />,
      title: "Superior Voice Recognition",
      description: "Industry-leading voice recognition technology that works in any environment with 99.9% accuracy.",
      details: [
        "Noise cancellation",
        "Multi-language support",
        "Accent adaptation",
        "Real-time processing"
      ]
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Privacy & Security",
      description: "Your data is encrypted and protected with enterprise-grade security. We never store personal conversations.",
      details: [
        "End-to-end encryption",
        "Local processing",
        "No data retention",
        "GDPR compliant"
      ]
    }
  ]

  const capabilities = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Smart Conversations",
      description: "Engage in natural, flowing conversations with contextual understanding."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Schedule Management",
      description: "Manage your calendar, set reminders, and organize your daily tasks."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Instant Search",
      description: "Get quick answers to questions and search the web with voice commands."
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Media Control",
      description: "Control your music, podcasts, and media playback hands-free."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Device Integration",
      description: "Seamlessly integrate with your smart devices and IoT ecosystem."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Sync",
      description: "Sync your preferences and settings across all your devices."
    }
  ]

  const platforms = [
    {
      name: "Windows",
      description: "Full desktop experience with system integration"
    },
    {
      name: "macOS",
      description: "Native Mac app with Spotlight integration"
    },
    {
      name: "iOS",
      description: "Mobile app with Siri Shortcuts support"
    },
    {
      name: "Android",
      description: "Android app with Google Assistant integration"
    },
    {
      name: "Web",
      description: "Browser-based access from any device"
    },
    {
      name: "Linux",
      description: "Command-line and GUI versions available"
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Powerful <span className="bg-gradient-primary bg-clip-text text-transparent">Features</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover the comprehensive suite of features that make Rehbar AI the most 
              advanced voice assistant for modern users.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="space-y-20">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="text-purple-400 mb-6">
                    {feature.icon}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-6">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-gray-300 mb-8">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-8 ${
                  index % 2 === 1 ? 'lg:col-start-1' : ''
                }`}>
                  <div className="aspect-video bg-gradient-primary rounded-lg flex items-center justify-center">
                    <div className="text-white text-6xl opacity-50">
                      {feature.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What You Can Do
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore the wide range of tasks and activities Rehbar AI can help you with.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 hover:bg-white-10 transition duration-300"
              >
                <div className="text-purple-400 mb-4">
                  {capability.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {capability.title}
                </h3>
                <p className="text-gray-400">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Available Everywhere
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Access Rehbar AI on all your devices with native apps and seamless synchronization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center hover:bg-white-10 transition duration-300"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {platform.name}
                </h3>
                <p className="text-gray-400">
                  {platform.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Technical Specifications
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology for optimal performance and reliability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Response Time</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">&lt;100ms</p>
              <p className="text-gray-400 text-sm">Average response time</p>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center">
              <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Accuracy</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">99.9%</p>
              <p className="text-gray-400 text-sm">Voice recognition accuracy</p>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center">
              <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Languages</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">50+</p>
              <p className="text-gray-400 text-sm">Supported languages</p>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center">
              <Cloud className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Uptime</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">99.99%</p>
              <p className="text-gray-400 text-sm">Service availability</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features
