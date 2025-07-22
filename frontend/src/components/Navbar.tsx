import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { PrimaryButton } from './PrimaryButton'
import {
  Menu,
  X,
  MessageSquare,
  ChevronDown,
  Chrome,
  Monitor,
  Mic,
  BarChart3,
  HelpCircle,
  ArrowRight
} from 'lucide-react'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    {
      name: 'Product',
      href: '#',
      dropdown: [
        {
          name: 'Chrome Extension',
          href: '/extension',
          icon: <Chrome className="w-4 h-4" />,
          description: 'AI assistance in your browser'
        },
        {
          name: 'Desktop App',
          href: '/desktop',
          icon: <Monitor className="w-4 h-4" />,
          description: 'Full-featured desktop experience'
        },
        {
          name: 'Interview Assistant',
          href: '/interview',
          icon: <Mic className="w-4 h-4" />,
          description: 'Ace your next interview'
        },
        {
          name: 'Analytics',
          href: '/dashboard',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Track your progress'
        },
      ]
    },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Help', href: '/help' },
    { name: 'About', href: '/about' }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary-950/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="w-10 h-10 bg-gradient-blue-primary rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="w-5 h-5 text-black" />
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-gradient-blue transition-colors">
              Rehbar AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors font-medium">
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-80 glass-effect backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.href}
                                className="flex items-start space-x-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                                  {dropdownItem.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{dropdownItem.name}</div>
                                  <div className="text-sm text-white/60">{dropdownItem.description}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`text-white/80 hover:text-white transition-colors font-medium ${
                      isActive(item.href) ? 'text-gradient-blue' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <PrimaryButton href="/download" size="md">
              Get Started
            </PrimaryButton>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden glass-effect backdrop-blur-xl border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 sm:px-6 py-6 space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <div className="text-white font-medium mb-3">{item.name}</div>
                      <div className="pl-4 space-y-3">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.icon}
                            <span>{dropdownItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="block text-white/80 hover:text-white transition-colors font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Link
                  to="/login"
                  className="block text-white/80 hover:text-white transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <PrimaryButton href="/download" className="w-full">
                  Get Started
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
