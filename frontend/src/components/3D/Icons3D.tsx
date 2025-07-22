import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Mic, Shield, Zap } from 'lucide-react'

// CSS-based 3D Icon Container
const Icon3DContainer = ({
  children,
  color = "from-blue-500 to-purple-600",
  size = 80
}: {
  children: React.ReactNode
  color?: string
  size?: number
}) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-2xl`}
      style={{
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
        filter: 'drop-shadow(0 0 20px rgba(79, 172, 254, 0.4))'
      }}
      animate={{
        rotateY: [0, 360],
        rotateX: [0, 10, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
      whileHover={{
        scale: 1.1,
        rotateY: 180,
        filter: 'drop-shadow(0 0 30px rgba(79, 172, 254, 0.8))'
      }}
    >
      {/* 3D Depth Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl transform translate-x-1 translate-y-1"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-black/20 to-transparent rounded-2xl transform -translate-x-1 -translate-y-1"></div>

      {/* Icon */}
      <div className="relative z-10 text-white">
        {children}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  )
}

// Individual 3D Icons
const Brain3D = ({ size = 32 }: { size?: number }) => (
  <Icon3DContainer color="from-blue-500 to-cyan-400" size={size * 2.5}>
    <Brain size={size} className="animate-pulse" />
  </Icon3DContainer>
)

const Microphone3D = ({ size = 32 }: { size?: number }) => (
  <Icon3DContainer color="from-purple-500 to-pink-500" size={size * 2.5}>
    <Mic size={size} className="animate-bounce" />
  </Icon3DContainer>
)

const Shield3D = ({ size = 32 }: { size?: number }) => (
  <Icon3DContainer color="from-green-500 to-teal-400" size={size * 2.5}>
    <Shield size={size} className="animate-pulse" />
  </Icon3DContainer>
)

const Lightning3D = ({ size = 32 }: { size?: number }) => (
  <Icon3DContainer color="from-yellow-500 to-orange-500" size={size * 2.5}>
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Zap size={size} />
    </motion.div>
  </Icon3DContainer>
)

// Icon3D Component Props
interface Icon3DProps {
  type: 'brain' | 'microphone' | 'shield' | 'lightning'
  size?: number
  className?: string
}

// Main Icon3D Component
export const Icon3D: React.FC<Icon3DProps> = ({ type, size = 32, className = '' }) => {
  const renderIcon = () => {
    switch (type) {
      case 'brain':
        return <Brain3D size={size} />
      case 'microphone':
        return <Microphone3D size={size} />
      case 'shield':
        return <Shield3D size={size} />
      case 'lightning':
        return <Lightning3D size={size} />
      default:
        return <Brain3D size={size} />
    }
  }

  return (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      whileHover={{
        scale: 1.1,
        rotateY: 10,
        rotateX: 10,
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {renderIcon()}
    </motion.div>
  )
}

// Animated 3D Icon Grid
export const Icon3DGrid: React.FC = () => {
  const icons = [
    { type: 'brain' as const, title: 'AI Intelligence', description: 'Advanced neural networks' },
    { type: 'microphone' as const, title: 'Voice Recognition', description: 'Crystal clear audio processing' },
    { type: 'shield' as const, title: 'Privacy First', description: 'End-to-end encryption' },
    { type: 'lightning' as const, title: 'Lightning Fast', description: 'Instant AI responses' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {icons.map((icon, index) => (
        <motion.div
          key={icon.type}
          initial={{ opacity: 0, y: 50, rotateY: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            type: "spring",
            stiffness: 100
          }}
          className="text-center group"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="mb-6">
            <Icon3D type={icon.type} size={40} className="mx-auto" />
          </div>

          <motion.div
            className="space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
              {icon.title}
            </h3>
            <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
              {icon.description}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
