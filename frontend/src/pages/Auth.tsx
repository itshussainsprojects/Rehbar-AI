import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import { NetworkStatus, AuthErrorBoundary, useAuthErrorHandler } from '../components/NetworkStatus'
import { Mail, Lock, User, Phone, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react'
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithPhone,
  verifyPhoneCode
} from '../config/firebase'

export default function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === '/login'
  const isSignup = location.pathname === '/signup'
  const isForgot = location.pathname === '/forgot'

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        // Register with Firebase
        console.log('🔐 Starting registration process...')
        console.log('📧 Email:', formData.email)
        console.log('👤 Name:', formData.name || formData.email.split('@')[0])

        const result = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.name || formData.email.split('@')[0]
        )

        console.log('📋 Registration result:', result)

        if (result.success) {
          setSuccess('Account created successfully! Redirecting to dashboard...')
          setTimeout(() => navigate('/dashboard'), 2000)
        } else {
          console.error('❌ Registration failed:', result.error)
          throw new Error(result.error)
        }
      } else {
        // Login with Firebase
        const result = await signInWithEmail(formData.email, formData.password)

        if (result.success) {
          setSuccess('Signed in successfully! Redirecting to dashboard...')
          setTimeout(() => navigate('/dashboard'), 2000)
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed')
    }

    setLoading(false)
  }

  const { executeWithErrorHandling } = useAuthErrorHandler()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    const result = await executeWithErrorHandling(async () => {
      // Check network connectivity first
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.')
      }

      const authResult = await signInWithGoogle()

      if (authResult.success) {
        setSuccess('Google sign-in successful! Redirecting to dashboard...')
        setTimeout(() => navigate('/dashboard'), 2000)
        return authResult
      } else {
        throw new Error(authResult.error)
      }
    })

    if (!result) {
      // Error was handled by executeWithErrorHandling
      setError('Google sign-in failed. Please try again.')
    }

    setLoading(false)
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (phoneStep === 'input') {
        const result = await signInWithPhone(formData.phone, formData.name)
        if (result.success) {
          setConfirmationResult(result.confirmationResult)
          setPhoneStep('verify')
          setSuccess('Verification code sent to your phone!')
        } else {
          throw new Error(result.error)
        }
      } else {
        const result = await verifyPhoneCode(
          confirmationResult,
          formData.verificationCode,
          formData.phone,
          formData.name
        )
        if (result.success) {
          setSuccess('Phone verification successful! Redirecting to dashboard...')
          setTimeout(() => navigate('/dashboard'), 2000)
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error: any) {
      setError(error.message || 'Phone authentication failed')
    }

    setLoading(false)
  }

  const getTitle = () => {
    if (isLogin) return 'Welcome Back'
    if (isSignup) return 'Create Account'
    if (isForgot) return 'Reset Password'
    return 'Authentication'
  }

  const getSubtitle = () => {
    if (isLogin) return 'Sign in to your Rehbar AI account'
    if (isSignup) return 'Join thousands of users transforming their conversations'
    if (isForgot) return 'Enter your email to reset your password'
    return ''
  }

  return (
    <AuthErrorBoundary>
      <NetworkStatus onRetry={() => window.location.reload()} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4"
      >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-satoshi font-black text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-white/70">
            {getSubtitle()}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm"
              >
                {success}
              </motion.div>
            )}

            {!isForgot && (
              <>
                {/* Authentication Method Tabs */}
                <div className="flex mb-6 bg-white/5 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      authMethod === 'email'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    📧 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      authMethod === 'phone'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    📱 Phone
                  </button>
                </div>

                {/* Google Sign-In Button */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full mb-6 py-3 px-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </motion.button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">Or continue with {authMethod}</span>
                  </div>
                </div>
              </>
            )}

            {/* Email Authentication Form */}
            {(authMethod === 'email' || isForgot) && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gradient-blue-a focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gradient-blue-a focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {!isForgot && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gradient-blue-a focus:border-transparent transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gradient-blue-a focus:border-transparent transition-all duration-300"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              <PrimaryButton
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  isLogin ? 'Sign In' : (isSignup ? 'Create Account' : 'Send Reset Link')
                )}
              </PrimaryButton>
            </form>
            )}

            {/* Phone Authentication Form */}
            {authMethod === 'phone' && !isForgot && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                {phoneStep === 'input' ? (
                  <>
                    {isSignup && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (+1234567890)"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div id="recaptcha-container"></div>

                    <PrimaryButton
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </PrimaryButton>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-white/80 text-sm">
                        Enter the 6-digit code sent to {formData.phone}
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        name="verificationCode"
                        placeholder="Enter 6-digit code"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <PrimaryButton
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={() => setPhoneStep('input')}
                      className="w-full text-white/60 hover:text-white text-sm underline"
                    >
                      Change phone number
                    </button>
                  </>
                )}
              </form>
            )}



            <div className="mt-6 text-center">
              {isLogin && (
                <div className="space-y-2">
                  <p className="text-white/60">
                    Don't have an account?{' '}
                    <a href="/signup" className="text-gradient-blue hover:underline">
                      Sign up
                    </a>
                  </p>
                  <p className="text-white/60">
                    <a href="/forgot" className="text-gradient-blue hover:underline">
                      Forgot your password?
                    </a>
                  </p>
                </div>
              )}
              
              {isSignup && (
                <p className="text-white/60">
                  Already have an account?{' '}
                  <a href="/login" className="text-gradient-blue hover:underline">
                    Sign in
                  </a>
                </p>
              )}
              
              {isForgot && (
                <p className="text-white/60">
                  Remember your password?{' '}
                  <a href="/login" className="text-gradient-blue hover:underline">
                    Sign in
                  </a>
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
    </AuthErrorBoundary>
  )
}
