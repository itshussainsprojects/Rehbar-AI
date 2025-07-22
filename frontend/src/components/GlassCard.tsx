import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'dark' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = cn(
    'relative overflow-hidden transition-all duration-200 ease-out',
    onClick && 'cursor-pointer'
  )

  const variantClasses = {
    default: cn(
      'glass-effect backdrop-blur-xl shadow-lg',
      hover && 'hover:bg-white/10 hover:shadow-glow hover:border-accent-500/50 hover:-translate-y-2'
    ),
    dark: cn(
      'bg-primary-950/80 backdrop-blur-xl border border-white/5 shadow-xl',
      hover && 'hover:bg-primary-950/90 hover:shadow-glow hover:border-accent-500/30 hover:-translate-y-2'
    ),
    bordered: cn(
      'glass-effect border-2 border-white/10 shadow-lg',
      hover && 'hover:border-accent-500/50 hover:shadow-glow hover:-translate-y-2'
    ),
    elevated: cn(
      'glass-effect shadow-xl border border-white/10',
      hover && 'hover:shadow-glow-lg hover:-translate-y-3'
    )
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  }

  const radiusClasses = {
    default: 'rounded-2xl',
    dark: 'rounded-2xl',
    bordered: 'rounded-xl',
    elevated: 'rounded-3xl'
  }

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        radiusClasses[variant],
        className
      )}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
