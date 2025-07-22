import React from 'react'
import { Target, Users, Award, Globe } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Innovation",
      description: "We constantly push the boundaries of AI technology to deliver cutting-edge solutions."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User-Centric",
      description: "Every feature is designed with our users' needs and experiences at the forefront."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for perfection in every aspect of our product and service delivery."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Accessibility",
      description: "Making advanced AI technology accessible to everyone, everywhere."
    }
  ]

  const team = [
    {
      name: "Dr. Sarah Ahmed",
      role: "CEO & Co-Founder",
      bio: "Former AI researcher at MIT with 15+ years in machine learning and natural language processing."
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Google engineer specializing in voice recognition and real-time AI systems."
    },
    {
      name: "Dr. Priya Patel",
      role: "Head of AI Research",
      bio: "PhD in Computer Science from Stanford, leading our AI innovation and research initiatives."
    },
    {
      name: "James Wilson",
      role: "Head of Product",
      bio: "Product management veteran with experience at Apple and Microsoft, focusing on user experience."
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="bg-gradient-primary bg-clip-text text-transparent">Rehbar AI</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize AI technology and make intelligent voice assistance 
              accessible to everyone. Founded in 2023, Rehbar AI represents the next generation 
              of human-computer interaction.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6">
                To bridge the gap between humans and technology through intelligent, 
                intuitive voice interactions that enhance productivity and simplify 
                digital experiences.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                We believe that AI should be a tool that empowers people, not replaces them. 
                Our technology is designed to understand context, learn from interactions, 
                and provide personalized assistance that adapts to each user's unique needs.
              </p>
              <p className="text-lg text-gray-300">
                With privacy and security at our core, we're building the future of 
                AI assistance that users can trust and rely on for their most important tasks.
              </p>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 mb-6">
                "To create a world where technology understands and responds to human needs 
                naturally, making digital interactions as intuitive as human conversations."
              </p>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-purple-400 font-semibold">
                  "AI that truly understands you"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do at Rehbar AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center hover:bg-white-10 transition duration-300"
              >
                <div className="text-purple-400 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The brilliant minds behind Rehbar AI's innovative technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6 text-center"
              >
                <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence and user satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400">Accuracy Rate</div>
            </div>
            <div className="bg-white-5 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
