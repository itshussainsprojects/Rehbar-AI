import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  MessageSquare,
  Brain,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Lightbulb
} from 'lucide-react'

export default function Interview() {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [suggestions, setSuggestions] = useState([])

  const interviewTypes = [
    {
      title: "Technical Interview",
      description: "Get help with coding questions, system design, and technical discussions",
      icon: "💻",
      features: ["Code review assistance", "System design guidance", "Technical terminology help"]
    },
    {
      title: "Behavioral Interview",
      description: "Navigate behavioral questions with confidence and structured responses",
      icon: "🧠",
      features: ["STAR method guidance", "Story structuring", "Confidence building"]
    },
    {
      title: "Sales Interview",
      description: "Master sales scenarios, objection handling, and client conversations",
      icon: "💼",
      features: ["Objection handling", "Value proposition", "Closing techniques"]
    },
    {
      title: "Leadership Interview",
      description: "Demonstrate leadership skills and management experience effectively",
      icon: "👑",
      features: ["Leadership examples", "Team management", "Strategic thinking"]
    }
  ]

  const liveFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Real-Time Suggestions",
      description: "Get instant response ideas while the interviewer is speaking"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Question Analysis",
      description: "Understand what the interviewer is really asking for"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Resume Integration",
      description: "Pull relevant experiences from your uploaded resume"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Tracking",
      description: "Monitor your speaking pace, confidence, and clarity"
    }
  ]

  const mockSuggestions = [
    "Mention your experience with React and TypeScript from your previous role",
    "Use the STAR method: Situation, Task, Action, Result",
    "Highlight the 40% performance improvement you achieved",
    "Connect this to your leadership experience at TechCorp"
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-16"
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-satoshi font-black text-white mb-6">
              Ace Every Interview with{' '}
              <span className="text-gradient-blue">AI Guidance</span>
            </h1>

            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              Real-time AI assistance that helps you answer questions confidently,
              structure responses effectively, and showcase your best self.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryButton size="lg" className="text-lg px-8 py-4">
                Start Practice Session
              </PrimaryButton>

              <motion.button
                className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Live Interview Interface */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Live Interview Assistant</h3>

                  <div className="space-y-6">
                    {/* Recording Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-blue hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <Square className="w-6 h-6 text-white" />
                        ) : (
                          <Mic className="w-6 h-6 text-black" />
                        )}
                      </button>

                      <div>
                        <div className="text-white font-semibold">
                          {isRecording ? 'Recording...' : 'Ready to Record'}
                        </div>
                        <div className="text-white/60 text-sm">
                          {isRecording ? 'Click to stop' : 'Click to start listening'}
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white/80">
                          {isConnected ? 'AI Assistant Connected' : 'Connecting...'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <span className="text-white/80">Resume Loaded</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                        <span className="text-white/80">Interview Mode: Technical</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <PrimaryButton className="w-full" size="sm">
                        Upload Resume
                      </PrimaryButton>
                      <PrimaryButton variant="outline" className="w-full" size="sm">
                        Change Interview Type
                      </PrimaryButton>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions Panel */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">AI Suggestions</h3>

                  {isRecording ? (
                    <div className="space-y-4">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Lightbulb className="w-5 h-5 text-blue-400 mt-1" />
                          <div>
                            <div className="text-white font-medium mb-2">Current Question Detected:</div>
                            <div className="text-white/80 text-sm mb-3">
                              "Tell me about a time you had to solve a complex technical problem."
                            </div>
                            <div className="text-blue-400 text-sm font-medium">
                              💡 This is a behavioral question - use the STAR method
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {mockSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            className="bg-white/10 rounded-lg p-3 border border-white/20"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="text-white/90 text-sm">{suggestion}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Mic className="w-16 h-16 text-white/40 mx-auto mb-4" />
                      <div className="text-white/60">
                        Start recording to see AI suggestions
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Interview Types */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Specialized for Every Interview Type
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Rehbar AI adapts to different interview formats and provides targeted assistance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {interviewTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 h-full hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="text-4xl">{type.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                      <p className="text-white/70">{type.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <PrimaryButton className="w-full">
                    Start {type.title}
                  </PrimaryButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Powerful Features for Interview Success
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything you need to perform your best in any interview situation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {liveFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-start space-x-6"
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Real results from professionals who used Rehbar AI in their interviews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer",
                company: "Google",
                result: "Landed dream job",
                quote: "Rehbar AI helped me structure my technical responses perfectly. I felt so much more confident.",
                avatar: "👩‍💻"
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager",
                company: "Microsoft",
                result: "40% salary increase",
                quote: "The behavioral question guidance was incredible. I nailed every STAR response.",
                avatar: "👨‍💼"
              },
              {
                name: "Emily Johnson",
                role: "Sales Director",
                company: "Salesforce",
                result: "Promoted to leadership",
                quote: "The real-time suggestions helped me handle tough questions I wasn't prepared for.",
                avatar: "👩‍💼"
              }
            ].map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center h-full">
                  <div className="text-4xl mb-4">{story.avatar}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{story.name}</h3>
                  <p className="text-white/60 mb-2">{story.role} at {story.company}</p>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {story.result}
                  </div>
                  <p className="text-white/80 italic">"{story.quote}"</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've landed their dream jobs with Rehbar AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                Start Practice Session
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Watch Demo
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
