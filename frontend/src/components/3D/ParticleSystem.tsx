import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// CSS-based Particle Field
const ParticleField = ({ count = 100 }: { count?: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      color: `hsl(${200 + Math.random() * 60}, 80%, ${50 + Math.random() * 30}%)`,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(particle.id) * 50, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// CSS-based Connection Lines
const ConnectionLines = ({ count = 20 }: { count?: number }) => {
  const lines = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 3,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full">
        {lines.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="rgba(0, 242, 254, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
            transition={{
              duration: line.duration,
              delay: line.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// CSS-based DNA Helix
const DNAHelix = () => {
  const helixPoints = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const t = (i / 50) * Math.PI * 4
      const radius = 30
      return {
        id: i,
        x: 50 + Math.cos(t) * radius,
        y: 20 + (i / 50) * 60,
        delay: i * 0.1,
      }
    })
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {helixPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute w-3 h-3 bg-purple-500 rounded-full"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            boxShadow: '0 0 10px rgba(102, 126, 234, 0.8)',
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 1, 0.3],
            x: [0, Math.sin(point.id * 0.5) * 20, 0],
          }}
          transition={{
            duration: 3,
            delay: point.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Main Particle System Component
export const ParticleSystem: React.FC<{
  variant?: 'field' | 'helix' | 'network'
  className?: string
}> = ({
  variant = 'field',
  className = ''
}) => {
  const renderParticles = () => {
    switch (variant) {
      case 'helix':
        return <DNAHelix />
      case 'network':
        return (
          <>
            <ParticleField count={80} />
            <ConnectionLines count={15} />
          </>
        )
      default:
        return <ParticleField count={60} />
    }
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {renderParticles()}
    </div>
  )
}

// Interactive Particle Background
export const InteractiveParticles: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <ParticleSystem variant="network" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10"></div>

      {/* Additional floating elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Particle Burst Effect
export const ParticleBurst: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const mesh = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }
    
    return positions
  }, [])

  useFrame((state) => {
    if (mesh.current && trigger) {
      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < 500; i++) {
        const i3 = i * 3
        const velocity = 0.1
        const angle = (i / 500) * Math.PI * 2
        
        positions[i3] += Math.cos(angle) * velocity
        positions[i3 + 1] += Math.sin(angle) * velocity
        positions[i3 + 2] += (Math.random() - 0.5) * velocity
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={500}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4facfe"
        size={0.03}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
