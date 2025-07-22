import React, { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// CSS-based Floating 3D Elements
const FloatingElement = ({
  position,
  color,
  shape = 'sphere',
  size = 20
}: {
  position: { x: string; y: string }
  color: string
  shape?: 'sphere' | 'box' | 'torus' | 'cylinder'
  size?: number
}) => {
  const shapeStyles = {
    sphere: `w-${size} h-${size} rounded-full bg-gradient-to-br ${color}`,
    box: `w-${size} h-${size} bg-gradient-to-br ${color} transform rotate-45`,
    torus: `w-${size} h-${size} rounded-full border-4 border-transparent bg-gradient-to-br ${color}`,
    cylinder: `w-${size/2} h-${size} bg-gradient-to-b ${color} rounded-full`
  }

  return (
    <motion.div
      className={`absolute ${shapeStyles[shape]} shadow-2xl`}
      style={{
        left: position.x,
        top: position.y,
        filter: 'drop-shadow(0 0 20px rgba(79, 172, 254, 0.4))',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        y: [0, -30, 0],
        rotateX: [0, 360],
        rotateY: [0, 180, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  )
}

// CSS-based 3D Background Scene
const Background3D = () => {
  const elements = [
    { position: { x: '10%', y: '20%' }, color: 'from-blue-500 to-cyan-400', shape: 'sphere' as const },
    { position: { x: '80%', y: '30%' }, color: 'from-purple-500 to-pink-500', shape: 'box' as const },
    { position: { x: '20%', y: '70%' }, color: 'from-green-500 to-teal-400', shape: 'torus' as const },
    { position: { x: '70%', y: '60%' }, color: 'from-yellow-500 to-orange-500', shape: 'cylinder' as const },
    { position: { x: '50%', y: '40%' }, color: 'from-indigo-500 to-purple-600', shape: 'sphere' as const },
    { position: { x: '30%', y: '80%' }, color: 'from-pink-500 to-rose-500', shape: 'box' as const },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((element, index) => (
        <FloatingElement
          key={index}
          position={element.position}
          color={element.color}
          shape={element.shape}
          size={16 + Math.random() * 8}
        />
      ))}

      {/* Additional animated particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Parallax 3D Section
export const Parallax3DSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Background3D />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none"></div>
    </motion.div>
  )
}

// 3D Card with Hover Effects
export const Card3D: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* 3D Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300"></div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  )
}

// Scroll-triggered 3D Animation
export const ScrollTrigger3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.2"]
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        rotateX,
        opacity,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className="transform-gpu"
    >
      {children}
    </motion.div>
  )
}

// Magnetic 3D Effect
export const Magnetic3D: React.FC<{ children: React.ReactNode; strength?: number }> = ({ 
  children, 
  strength = 0.3 
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      
      const rotateX = (y / rect.height) * strength * 20
      const rotateY = (x / rect.width) * strength * 20
      
      element.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    }

    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return (
    <div
      ref={ref}
      className="transition-transform duration-200 ease-out transform-gpu"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}
