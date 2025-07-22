import React from 'react'
import { motion } from 'framer-motion'

export default function History() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-satoshi font-bold text-white mb-8">History</h1>
        <p className="text-white/70">History page coming soon...</p>
      </div>
    </motion.div>
  )
}
