import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import { WaveDivider } from '../components/WaveDivider'
import {
  Mic,
  Brain,
  Shield,
  Zap,
  Chrome,
  Monitor,
  Star,
  Play,
  ArrowRight,
  MessageSquare,
  FileText,
  BarChart3,
  Headphones,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Globe
} from 'lucide-react'

// 3D Compass Component
function Compass() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <cylinderGeometry args={[2, 2, 0.2, 32]} />
      <meshStandardMaterial color="#8FD8FF" metalness={0.8} roughness={0.2} />
      
      {/* Compass needle */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.1, 1.5, 8]} />
        <meshStandardMaterial color="#7B61FF" emissive="#7B61FF" emissiveIntensity={0.3} />
      </mesh>
    </mesh>
  )
}

// 3D Scene
function HeroScene() {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7B61FF" />
      
      <Suspense fallback={null}>
        <Compass />
      </Suspense>
    </Canvas>
  )
}

export default function Landing() {
  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Real-Time Conversation Copilot",
      description: "Get AI-powered prompts while you're speaking — including response suggestions, follow-up questions, and dynamic conversation tracks.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track live communication across clarity, conviction, and engagement — with personalized coaching to help you improve on-the-fly.",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Sync & Smart Retrieval",
      description: "Upload your notes, briefs, or PDFs — Rehbar scans them and pulls the right snippets into your conversations automatically.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Live Response Handling",
      description: "Rehbar listens for questions and instantly surfaces the right responses, information, or rebuttals — no tab-switching needed.",
      gradient: "from-yellow-500 to-red-500"
    }
  ]

  const companies = [
    {
      name: "Salesforce",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    {
      name: "HubSpot",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      name: "Zoom",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    },
    {
      name: "Slack",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    {
      name: "Microsoft",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
        </svg>
      )
    },
    {
      name: "Notion",
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.187z"/>
        </svg>
      )
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "👩‍💼",
      content: "Rehbar AI has transformed how I handle meetings. The real-time suggestions are incredibly accurate and helpful.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Sales Director",
      company: "SalesForce",
      avatar: "👨‍💼",
      content: "Our team's confidence in client calls has increased dramatically. It's like having a coach in your ear.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "HR Manager",
      company: "StartupXYZ",
      avatar: "👩‍🎓",
      content: "Interview processes are so much smoother now. Candidates appreciate the natural conversation flow.",
      rating: 5
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <HeroScene />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-satoshi font-black text-white mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Invisible AI to{' '}
            <span className="text-gradient-blue">Guide</span>
            <br />
            Your Voice in Every{' '}
            <span className="text-gradient-blue">Conversation</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Hands-free AI assistant that provides real-time conversation guidance,
            intelligent responses, and confidence-boosting insights for any interaction.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PrimaryButton size="lg" className="group text-lg px-8 py-4">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
          </motion.div>

          <motion.div
            className="flex items-center justify-center space-x-8 text-white/60"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No Download Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Works in Any Browser</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Free to Start</span>
            </div>
          </motion.div>
        </div>
        
        <WaveDivider className="absolute bottom-0 text-black" />
      </section>

      {/* Feature Strip */}
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
              Powerful Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need for seamless voice-powered conversations
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
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

      {/* Video Showcase */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Watch how Rehbar AI transforms your conversations
            </p>
          </motion.div>
          
          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-video bg-gradient-to-br from-gradient-blue-a/20 to-electric-violet/20 rounded-2xl overflow-hidden glass-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center group hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-16 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-white/70 text-lg">Trusted by teams at</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                className="flex flex-col items-center space-y-3 text-white/60 hover:text-white/90 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ opacity: 1, scale: 1.05 }}
              >
                <div className="text-accent-400 hover:text-gradient-blue transition-colors">
                  {company.logo}
                </div>
                <span className="text-white/70 text-sm font-medium">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              What Users Say
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Join thousands who've transformed their conversations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
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
              Integrate Seamlessly with Your Existing Tools
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Rehbar AI works with your favorite meeting platforms and productivity tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Zoom", icon: "📹", description: "Works seamlessly with Zoom meetings" },
              { name: "Google Meet", icon: "🎥", description: "Perfect integration with Google Meet" },
              { name: "Microsoft Teams", icon: "👥", description: "Native support for Teams calls" },
              { name: "Slack", icon: "💬", description: "Connect with your Slack workspace" },
              { name: "Discord", icon: "🎮", description: "Voice assistance for Discord calls" },
              { name: "WebEx", icon: "🌐", description: "Full WebEx compatibility" }
            ].map((integration, index) => (
              <motion.div
                key={integration.name}
                className="glass-card p-6 text-center hover:bg-white/20 transition-all duration-300"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-4xl mb-4">{integration.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{integration.name}</h3>
                <p className="text-white/70">{integration.description}</p>
                <PrimaryButton className="mt-4 w-full" size="sm">
                  Connect
                </PrimaryButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
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
              Fully Hands-Free Experience for High-Performing Teams
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Forget the shortcuts. Rehbar AI does it all, automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {[
              {
                title: "Smart Follow-Up Generator",
                description: "Auto-draft personalized follow-up emails based on what was said during the call. Rehbar will listen, summarize key takeaways, and generate a tailored, high-converting follow-up — ready to send or edit right after your call.",
                icon: "📧",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                title: "Real-Time Coaching Mode",
                description: "Get live feedback and coaching during your conversations. Rehbar analyzes your speaking patterns, suggests improvements, and helps you become a more confident communicator.",
                icon: "🎯",
                gradient: "from-green-500 to-blue-500"
              },
              {
                title: "Multi-Language Support",
                description: "Communicate globally with confidence. Rehbar supports 50+ languages with accent-aware AI tuning to improve speech recognition and guidance accuracy across different dialects.",
                icon: "🌍",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Advanced Analytics Dashboard",
                description: "Track your communication performance over time. Get insights into your speaking patterns, confidence levels, and areas for improvement with detailed analytics and reporting.",
                icon: "📊",
                gradient: "from-yellow-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-8"
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-2xl`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-satoshi font-bold text-white mb-6">
              Ready to Transform Your Conversations?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join millions who trust Rehbar AI for their daily interactions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                Get Started Free
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                <Monitor className="w-5 h-5 mr-2" />
                Download Desktop
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
