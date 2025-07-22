import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  Users,
  Headphones,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Settings,
  Shield,
  Zap,
  Chrome,
  Monitor
} from 'lucide-react'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const categories = [
    {
      title: "Getting Started",
      icon: <Book className="w-6 h-6" />,
      description: "Learn the basics of Rehbar AI",
      articles: 12
    },
    {
      title: "Installation & Setup",
      icon: <Download className="w-6 h-6" />,
      description: "Install and configure Rehbar AI",
      articles: 8
    },
    {
      title: "Features & Usage",
      icon: <Settings className="w-6 h-6" />,
      description: "Master all Rehbar AI features",
      articles: 15
    },
    {
      title: "Troubleshooting",
      icon: <Shield className="w-6 h-6" />,
      description: "Solve common issues",
      articles: 10
    },
    {
      title: "Privacy & Security",
      icon: <Shield className="w-6 h-6" />,
      description: "Data protection and privacy",
      articles: 6
    },
    {
      title: "API Documentation",
      icon: <FileText className="w-6 h-6" />,
      description: "Developer resources",
      articles: 20
    }
  ]

  const faqs = [
    {
      question: "How do I get started with Rehbar AI?",
      answer: "Getting started is simple! First, sign up for a free account at rehbar-ai.com. Then, choose your preferred platform: install our Chrome extension for web-based conversations or download our desktop app for offline use. Once installed, you can immediately start using Rehbar AI in your meetings, interviews, and conversations."
    },
    {
      question: "What platforms does Rehbar AI support?",
      answer: "Rehbar AI works on multiple platforms: Chrome Extension (works with Zoom, Google Meet, Microsoft Teams, Discord, and any web-based platform), Desktop App (Windows, macOS, Linux), and Mobile App (iOS and Android coming soon). Our Chrome extension is the most popular choice as it works seamlessly with all major video conferencing tools."
    },
    {
      question: "Is my conversation data secure and private?",
      answer: "Absolutely! Your privacy is our top priority. All conversations are processed locally on your device when possible. When cloud processing is needed, we use end-to-end encryption. We never store your conversation content permanently, and all data is automatically deleted after processing. We're SOC 2 compliant and follow strict data protection standards."
    },
    {
      question: "How accurate is the voice recognition?",
      answer: "Our voice recognition technology achieves 99.9% accuracy across 50+ languages and dialects. We use advanced AI models that adapt to your speaking style, accent, and vocabulary over time. The system works well even in noisy environments and with multiple speakers."
    },
    {
      question: "Can I use Rehbar AI for different types of conversations?",
      answer: "Yes! Rehbar AI adapts to various conversation types including job interviews (technical, behavioral, leadership), sales calls, client meetings, team meetings, presentations, and casual conversations. You can select the conversation type to get specialized assistance and suggestions."
    },
    {
      question: "How does the real-time suggestion feature work?",
      answer: "Rehbar AI listens to your conversation in real-time and provides contextual suggestions through a discreet interface. It analyzes what's being said, understands the context, and offers response ideas, follow-up questions, and relevant information from your uploaded documents. Suggestions appear instantly without interrupting your flow."
    },
    {
      question: "Can I upload my own documents and notes?",
      answer: "Yes! You can upload resumes, notes, briefs, PDFs, and other documents. Rehbar AI scans these documents and automatically pulls relevant information during conversations. For example, during an interview, it might suggest mentioning a specific project from your resume that's relevant to the question being asked."
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes 5 AI-assisted sessions per month, basic voice recognition, document upload (up to 3 documents), and access to our Chrome extension. You'll also get email support and access to our community forum."
    },
    {
      question: "How do I upgrade to Pro or Enterprise?",
      answer: "You can upgrade anytime from your dashboard. Pro plan ($15/month) includes unlimited sessions, advanced analytics, priority support, and all features. Enterprise plans include custom integrations, SSO, admin controls, and dedicated support. Contact our sales team for Enterprise pricing."
    },
    {
      question: "Does Rehbar AI work offline?",
      answer: "Our desktop app includes offline capabilities for basic voice recognition and pre-loaded suggestions. However, the most advanced AI features require an internet connection. We're working on expanding offline functionality in future updates."
    }
  ]

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageSquare className="w-8 h-8" />,
      action: "Start Chat",
      available: "24/7"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: <Mail className="w-8 h-8" />,
      action: "Send Email",
      available: "Response within 24h"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: <Phone className="w-8 h-8" />,
      action: "Call Now",
      available: "Mon-Fri 9AM-6PM PST"
    },
    {
      title: "Video Tutorial",
      description: "Watch step-by-step guides",
      icon: <Video className="w-8 h-8" />,
      action: "Watch Videos",
      available: "50+ tutorials"
    }
  ]

  const quickLinks = [
    { title: "Download Chrome Extension", icon: <Chrome className="w-5 h-5" />, href: "/extension" },
    { title: "Download Desktop App", icon: <Monitor className="w-5 h-5" />, href: "/desktop" },
    { title: "API Documentation", icon: <FileText className="w-5 h-5" />, href: "/docs" },
    { title: "Community Forum", icon: <Users className="w-5 h-5" />, href: "/community" },
    { title: "Feature Requests", icon: <Zap className="w-5 h-5" />, href: "/feedback" },
    { title: "System Status", icon: <Shield className="w-5 h-5" />, href: "/status" }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-satoshi font-black text-white mb-6">
              How can we{' '}
              <span className="text-gradient-blue">help you?</span>
            </h1>

            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Find answers, get support, and learn how to make the most of Rehbar AI
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search for help articles, features, or common questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gradient-blue-a focus:border-transparent text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
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
              Browse Help Categories
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Find detailed guides and tutorials organized by topic
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full hover:bg-white/20 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-blue rounded-xl flex items-center justify-center mb-4">
                    {category.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-white/70 mb-4">{category.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{category.articles} articles</span>
                    <ExternalLink className="w-4 h-4 text-white/60" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Quick answers to the most common questions about Rehbar AI
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <GlassCard className="overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <ChevronDown className="w-5 h-5 text-white/60 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                    )}
                  </button>

                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-white/80 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
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
              Need More Help?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our support team is here to help you succeed with Rehbar AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                    {option.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-white/70 mb-4">{option.description}</p>
                  <p className="text-white/60 text-sm mb-6">{option.available}</p>

                  <PrimaryButton className="w-full">
                    {option.action}
                  </PrimaryButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              Quick Links
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Jump to the most popular resources and tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <motion.a
                key={link.title}
                href={link.href}
                className="flex items-center space-x-4 p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
                  {link.icon}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{link.title}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/60" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-black mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Our team is standing by to help you get the most out of Rehbar AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton
                size="lg"
                className="bg-black text-white hover:bg-gray-900"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Live Chat
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Email
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
