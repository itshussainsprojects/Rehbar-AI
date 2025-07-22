import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  magnetic?: boolean
  href?: string
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  magnetic = false,
  href,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Subtle magnetic effect for premium feel
  useEffect(() => {
    if (!magnetic) return

    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      // Much more subtle movement for professional feel
      button.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`
    }

    const handleMouseLeave = () => {
      button.style.transform = 'translate(0px, 0px)'
    }

    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [magnetic])

  const baseClasses = cn(
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'select-none cursor-pointer'
  )

  const variantClasses = {
    primary: cn(
      'bg-gradient-blue-primary text-black border-0 font-semibold shadow-md',
      'hover:shadow-glow hover:-translate-y-1 hover:brightness-110',
      'focus:ring-2 focus:ring-accent-500/50',
      'active:translate-y-0 active:shadow-md'
    ),
    secondary: cn(
      'glass-effect text-white border shadow-sm backdrop-blur-xl',
      'hover:bg-white/10 hover:border-accent-500/50 hover:shadow-glow hover:-translate-y-1',
      'focus:ring-2 focus:ring-accent-500/50',
      'active:translate-y-0 active:shadow-sm'
    ),
    outline: cn(
      'bg-transparent text-white border border-white/20',
      'hover:bg-white/5 hover:border-accent-500/50 hover:shadow-glow hover:-translate-y-1',
      'focus:ring-2 focus:ring-accent-500/50',
      'active:translate-y-0'
    ),
    ghost: cn(
      'bg-transparent text-white/80 border border-transparent',
      'hover:bg-white/5 hover:text-white hover:-translate-y-1',
      'focus:ring-2 focus:ring-accent-500/50',
      'active:translate-y-0'
    ),
    accent: cn(
      'bg-gradient-purple text-white border-0 font-semibold shadow-md',
      'hover:shadow-glow hover:-translate-y-1 hover:brightness-110',
      'focus:ring-2 focus:ring-purple-500/50',
      'active:translate-y-0 active:shadow-md'
    )
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3'
  }

  const Component = href ? motion.a : motion.button
  const componentProps = href ? { href } : { ...props }

  return (
    <Component
      ref={buttonRef}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      {...componentProps}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span className={cn('flex items-center', sizeClasses[size].split(' ').pop(), isLoading && 'opacity-0')}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </Component>
  )
}
