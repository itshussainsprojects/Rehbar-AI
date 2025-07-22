import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function Legal() {
  const location = useLocation()
  const isPrivacy = location.pathname === '/privacy'
  const isTerms = location.pathname === '/terms'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-satoshi font-bold text-white mb-8">
          {isPrivacy && 'Privacy Policy'}
          {isTerms && 'Terms of Service'}
        </h1>
        <p className="text-white/70">
          {isPrivacy && 'Privacy policy content coming soon...'}
          {isTerms && 'Terms of service content coming soon...'}
        </p>
      </div>
    </motion.div>
  )
}
