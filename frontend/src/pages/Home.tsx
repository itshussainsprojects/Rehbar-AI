import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import {
  Mic,
  Brain,
  Shield,
  Zap,
  Users,
  Star,
  Download,
  Play,
  ArrowRight
} from 'lucide-react'
import { Hero3D } from '../components/3D/Hero3D'
import { Icon3D, Icon3DGrid } from '../components/3D/Icons3D'
import { Parallax3DSection, Card3D, ScrollTrigger3D, Magnetic3D } from '../components/3D/ScrollAnimations'
import { InteractiveParticles } from '../components/3D/ParticleSystem'

const Home = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Intelligence",
      description: "Advanced AI that understands context and provides intelligent responses to your queries."
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice Recognition",
      description: "State-of-the-art voice recognition technology that understands natural speech patterns."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your conversations are private and secure. We never store or share your personal data."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Get instant responses with our optimized AI processing and real-time voice interaction."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "Rehbar AI has revolutionized how I manage my daily tasks. It's like having a personal assistant that truly understands me.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content: "The voice recognition is incredibly accurate, and the AI responses are contextually perfect. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Marketing Director",
      content: "I've tried many AI assistants, but Rehbar AI stands out with its intuitive interface and powerful capabilities.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Interactive Particle Background */}
      <InteractiveParticles />

      {/* 3D Hero Section */}
      <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Loading 3D Experience...</div></div>}>
        <Hero3D />
      </Suspense>

      {/* 3D Features Section */}
      <Parallax3DSection>
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <ScrollTrigger3D>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  <span className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b bg-clip-text text-transparent">
                    Powerful 3D Features
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Experience the most advanced AI technology with stunning 3D interactions
                </p>
              </div>
            </ScrollTrigger3D>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <ScrollTrigger3D key={index}>
                  <Magnetic3D>
                    <Card3D className="h-full">
                      <div className="text-center">
                        <div className="mb-6">
                          <Icon3D
                            type={index === 0 ? 'brain' : index === 1 ? 'microphone' : index === 2 ? 'shield' : 'lightning'}
                            size={80}
                            className="mx-auto"
                          />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-white/80">
                          {feature.description}
                        </p>
                      </div>
                    </Card3D>
                  </Magnetic3D>
                </ScrollTrigger3D>
              ))}
            </div>
          </div>
        </section>
      </Parallax3DSection>

      {/* 3D Testimonials Section */}
      <Parallax3DSection>
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <ScrollTrigger3D>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  <span className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b bg-clip-text text-transparent">
                    What Users Say
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Join thousands who've experienced the magic of 3D AI interactions
                </p>
              </div>
            </ScrollTrigger3D>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ScrollTrigger3D key={index}>
                  <Magnetic3D>
                    <Card3D className="h-full">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-white/80 mb-4 italic">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-white/60 text-sm">{testimonial.role}</p>
                      </div>
                    </Card3D>
                  </Magnetic3D>
                </ScrollTrigger3D>
              ))}
            </div>
          </div>
        </section>
      </Parallax3DSection>

      {/* 3D CTA Section */}
      <Parallax3DSection>
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto text-center">
            <ScrollTrigger3D>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b bg-clip-text text-transparent">
                    Ready for 3D Magic?
                  </span>
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Experience the most advanced AI with stunning 3D interactions.
                  Join the future of voice assistance today.
                </p>
                <Magnetic3D>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b text-white px-8 py-4 rounded-xl font-semibold hover:scale-110 transition-all duration-300 inline-flex items-center gap-2 shadow-2xl hover:shadow-blue-500/50"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Magnetic3D>
              </div>
            </ScrollTrigger3D>
          </div>
        </section>
      </Parallax3DSection>

      {/* 3D Stats Section */}
      <Parallax3DSection>
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "1M+", label: "Active Users" },
                { value: "99.9%", label: "Uptime" },
                { value: "50+", label: "Languages" },
                { value: "24/7", label: "Support" }
              ].map((stat, index) => (
                <ScrollTrigger3D key={index}>
                  <Magnetic3D>
                    <Card3D>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-white/70">{stat.label}</div>
                    </Card3D>
                  </Magnetic3D>
                </ScrollTrigger3D>
              ))}
            </div>
          </div>
        </section>
      </Parallax3DSection>
    </div>
  )
}

export default Home
