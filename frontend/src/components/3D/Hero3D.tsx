import React, { Suspense, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

// CSS-based 3D Floating Elements
const FloatingElement = ({
  children,
  delay = 0,
  duration = 4,
  className = ""
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [0, -20, 0],
        rotateY: [0, 360],
        rotateX: [0, 10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  )
}

// 3D Geometric Shapes
const GeometricShape = ({
  shape,
  color,
  size = 60,
  className = ""
}: {
  shape: 'cube' | 'sphere' | 'pyramid' | 'torus'
  color: string
  size?: number
  className?: string
}) => {
  const shapeStyles = {
    cube: `w-${size} h-${size} bg-gradient-to-br ${color} transform rotate-45`,
    sphere: `w-${size} h-${size} bg-gradient-radial ${color} rounded-full`,
    pyramid: `w-0 h-0 border-l-[${size/2}px] border-r-[${size/2}px] border-b-[${size}px] border-l-transparent border-r-transparent`,
    torus: `w-${size} h-${size} bg-gradient-to-br ${color} rounded-full border-8 border-transparent`
  }

  return (
    <div
      className={`${shapeStyles[shape]} ${className} shadow-2xl`}
      style={{
        background: shape === 'pyramid' ? `linear-gradient(135deg, ${color})` : undefined,
        borderBottomColor: shape === 'pyramid' ? color : undefined,
        filter: 'drop-shadow(0 0 20px rgba(79, 172, 254, 0.3))'
      }}
    />
  )
}

// Main Hero3D Component
export const Hero3D: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating 3D Shapes */}
        <FloatingElement delay={0} duration={6} className="top-20 left-10">
          <GeometricShape shape="cube" color="from-blue-500 to-purple-600" size={16} />
        </FloatingElement>

        <FloatingElement delay={1} duration={8} className="top-40 right-20">
          <GeometricShape shape="sphere" color="from-cyan-400 to-blue-500" size={20} />
        </FloatingElement>

        <FloatingElement delay={2} duration={5} className="bottom-40 left-20">
          <GeometricShape shape="pyramid" color="#4facfe" size={24} />
        </FloatingElement>

        <FloatingElement delay={0.5} duration={7} className="bottom-20 right-10">
          <GeometricShape shape="torus" color="from-purple-500 to-pink-500" size={18} />
        </FloatingElement>

        <FloatingElement delay={3} duration={6} className="top-60 left-1/2">
          <GeometricShape shape="cube" color="from-green-400 to-blue-500" size={14} />
        </FloatingElement>

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* 3D Text Effect */}
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
              style={{
                textShadow: '0 0 30px rgba(79, 172, 254, 0.5), 0 0 60px rgba(79, 172, 254, 0.3)',
                transform: 'perspective(1000px) rotateX(10deg)',
              }}
              animate={{
                textShadow: [
                  '0 0 30px rgba(79, 172, 254, 0.5), 0 0 60px rgba(79, 172, 254, 0.3)',
                  '0 0 40px rgba(0, 242, 254, 0.7), 0 0 80px rgba(0, 242, 254, 0.4)',
                  '0 0 30px rgba(79, 172, 254, 0.5), 0 0 60px rgba(79, 172, 254, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b bg-clip-text text-transparent">
                REHBAR AI
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Experience the future of AI with stunning 3D interactions and magical voice conversations
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                className="bg-gradient-to-r from-gradient-blue-a to-gradient-blue-b text-white px-8 py-4 rounded-xl font-semibold shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(79, 172, 254, 0.6)',
                  rotateY: 5,
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                Experience 3D Magic ✨
              </motion.button>

              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-sm"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  rotateY: -5,
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                Watch Demo 🎬
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>
    </div>
  )
}
