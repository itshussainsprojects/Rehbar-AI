import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { UserProfile, PlanDetails, userProfileService, planService } from '../services/firestore'
import {
  User,
  LogOut,
  Settings,
  Download,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Headphones,
  FileText,
  Zap,
  Calendar,
  TrendingUp,
  Shield,
  Bell
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { PrimaryButton } from '../components/PrimaryButton'

interface DashboardData {
  user: UserProfile
  availablePlans: PlanDetails[]
  canSelectPlan: boolean
  canDownload: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        fetchDashboardData()
      } else {
        // User is signed out
        console.log('No authenticated user, redirecting to login')
        navigate('/auth')
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.log('No authenticated user, redirecting to login')
        navigate('/auth')
        return
      }

      console.log('🔍 Fetching dashboard data for user:', currentUser.uid)

      // Check if user profile exists, if not create it
      console.log('📋 Checking for existing user profile...')
      let userProfile = await userProfileService.getUserProfile(currentUser.uid)
      console.log('📋 User profile result:', userProfile)
      if (!userProfile) {
        console.log('🆕 Creating new user profile...')
        const profileData: any = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        }

        if (currentUser.photoURL) {
          profileData.profilePicture = currentUser.photoURL
        }
        if (currentUser.phoneNumber) {
          profileData.phoneNumber = currentUser.phoneNumber
        }

        console.log('📝 Profile data to create:', profileData)

        try {
          await userProfileService.createUserProfile(profileData)
          console.log('✅ User profile created successfully')

          userProfile = await userProfileService.getUserProfile(currentUser.uid)
          console.log('📋 Retrieved created profile:', userProfile)

          if (!userProfile) {
            throw new Error('Failed to retrieve created user profile')
          }
        } catch (createError) {
          console.error('❌ Error creating user profile:', createError)
          throw new Error(`Failed to create user profile: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
        }
      }

      // Fetch available plans with better error handling
      console.log('📋 Fetching available plans...')
      let availablePlans: any[] = getDefaultPlans() // Start with default plans

      try {
        const firestorePlans = await planService.getAvailablePlans()
        console.log('📋 Firestore plans result:', firestorePlans)

        if (firestorePlans && firestorePlans.length > 0) {
          // Convert Firestore plans to match our format
          availablePlans = firestorePlans.map(plan => ({
            ...plan,
            popular: plan.popular || false,
            trialDays: plan.trialDays || 0
          }))
          console.log('✅ Using Firestore plans:', availablePlans.length, 'plans')
        } else {
          console.log('📝 No plans in Firestore, creating default plans...')
          await createDefaultPlans()

          // Try to fetch again after creating
          const newPlans = await planService.getAvailablePlans()
          if (newPlans && newPlans.length > 0) {
            availablePlans = newPlans.map(plan => ({
              ...plan,
              popular: plan.popular || false,
              trialDays: plan.trialDays || 0
            }))
            console.log('✅ Using newly created plans:', availablePlans.length, 'plans')
          } else {
            console.log('⚠️ Still no plans, using fallback defaults')
          }
        }
      } catch (planError) {
        console.error('❌ Error with plans:', planError)
        console.log('📋 Using fallback default plans:', availablePlans.length, 'plans')
      }

      console.log('📋 Final plans to use:', availablePlans)

      // Skip chat history for now to avoid index requirement
      console.log('💬 Skipping chat history to avoid Firestore index requirement')

      // Determine permissions
      console.log('🔐 Determining user permissions...')
      const canSelectPlan = userProfile.state === 'registered' || userProfile.state === 'rejected'
      const canDownload = userProfile.state === 'approved' || userProfile.state === 'active'

      console.log('🔐 User permissions:', {
        state: userProfile.state,
        canSelectPlan,
        canDownload
      })

      console.log('✅ Setting dashboard data...')
      console.log('📊 Dashboard data to set:', {
        user: userProfile.email,
        availablePlansCount: availablePlans.length,
        availablePlansNames: availablePlans.map(p => p.name),
        canSelectPlan,
        canDownload
      })

      setDashboardData({
        user: userProfile,
        availablePlans,
        canSelectPlan,
        canDownload
      })

      console.log('🎉 Dashboard data loaded successfully!')

      // Double check the data was set
      setTimeout(() => {
        console.log('🔍 Checking dashboard data after 1 second...')
      }, 1000)

    } catch (err) {
      console.error('❌ Dashboard fetch error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        currentUser: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName
        } : 'No current user'
      })
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPlans = () => [
    {
      id: 'free-trial',
      name: 'Free Trial',
      price: 0,
      duration: '3 days',
      features: ['3-day free trial', 'Basic AI interview assistance', 'Voice recognition', 'Limited daily usage', 'Email support'],
      limits: { meetingsPerDay: 2, voiceMinutesPerDay: 30, aiSuggestionsPerDay: 10 },
      popular: false,
      trialDays: 3
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 9.99,
      duration: 'month',
      features: ['Unlimited AI interview assistance', 'Advanced voice recognition', 'Real-time suggestions', 'Interview analytics', 'Email support', 'Chrome extension access'],
      limits: { meetingsPerDay: 10, voiceMinutesPerDay: 120, aiSuggestionsPerDay: 50 },
      popular: true,
      trialDays: 0
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 19.99,
      duration: 'month',
      features: ['Everything in Basic', 'Unlimited daily usage', 'Advanced AI models', 'Custom interview preparation', 'Priority support', 'API access', 'Team collaboration'],
      limits: { meetingsPerDay: -1, voiceMinutesPerDay: -1, aiSuggestionsPerDay: -1 },
      popular: false,
      trialDays: 0
    }
  ];

  const createDefaultPlans = async () => {
    try {
      const defaultPlans = getDefaultPlans();
      for (const plan of defaultPlans) {
        await planService.createPlan(plan);
        console.log(`✅ Created plan: ${plan.name}`);
      }
      console.log('🎉 All default plans created!');
    } catch (error) {
      console.error('❌ Error creating default plans:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut()
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      navigate('/auth')
    }
  }

  const getStateDisplay = (state: string) => {
    switch (state) {
      case 'registered':
        return { text: 'Welcome! Please select a plan', color: 'text-blue-600', icon: AlertCircle, bgColor: 'bg-blue-100' }
      case 'plan_selected':
        return { text: 'Plan selected', color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-100' }
      case 'pending_approval':
        return { text: 'Waiting for approval', color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-100' }
      case 'approved':
        return { text: 'Approved! You can now download', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-100' }
      case 'active':
        return { text: 'Active user', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-100' }
      case 'rejected':
        return { text: 'Plan rejected. Please select another plan', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-100' }
      default:
        return { text: state, color: 'text-gray-600', icon: AlertCircle, bgColor: 'bg-gray-100' }
    }
  }

  const handleDownload = (type: 'extension' | 'desktop') => {
    if (type === 'extension') {
      const link = document.createElement('a')
      link.href = '/downloads/rehbar-ai-extension.zip'
      link.download = 'rehbar-ai-extension.zip'
      link.click()
    } else {
      const link = document.createElement('a')
      link.href = '/downloads/rehbar-ai-desktop.zip'
      link.download = 'rehbar-ai-desktop.zip'
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  const { user, availablePlans, canSelectPlan, canDownload } = dashboardData
  const stateDisplay = getStateDisplay(user.state)
  const StateIcon = stateDisplay.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.displayName}!</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Member since {user.createdAt?.toDate().toLocaleDateString() || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${stateDisplay.bgColor}`}>
                  <StateIcon className={`h-4 w-4 ${stateDisplay.color}`} />
                  <span className={`font-medium text-sm ${stateDisplay.color}`}>{stateDisplay.text}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pricing')}>
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Select Plan</h3>
            <p className="text-sm text-gray-600">Choose your subscription</p>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/interview')}>
            <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Start Interview</h3>
            <p className="text-sm text-gray-600">Begin AI conversation</p>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View History</h3>
            <p className="text-sm text-gray-600">Past conversations</p>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
            <Settings className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Manage account</p>
          </GlassCard>
        </motion.div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Today's Meetings</h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{user.usage.meetingsToday}</div>
            <p className="text-sm text-gray-600">Meetings attended</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Voice Minutes</h3>
              <Headphones className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{user.usage.voiceMinutesToday}</div>
            <p className="text-sm text-gray-600">Minutes processed</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{user.usage.aiSuggestionsToday}</div>
            <p className="text-sm text-gray-600">Suggestions provided</p>
          </GlassCard>
        </motion.div>

        {/* Plan Status & Downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plan Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Plan Status</h3>
                <Shield className="h-6 w-6 text-blue-600" />
              </div>

              <div className={`p-4 rounded-lg ${stateDisplay.bgColor} mb-4`}>
                <div className="flex items-center space-x-3">
                  <StateIcon className={`h-6 w-6 ${stateDisplay.color}`} />
                  <div>
                    <p className={`font-medium ${stateDisplay.color}`}>{stateDisplay.text}</p>
                    <p className="text-sm text-gray-600">Current plan: {user.plan || 'No plan selected'}</p>
                  </div>
                </div>
              </div>

              {canSelectPlan && (
                <div className="space-y-3">
                  <PrimaryButton
                    onClick={() => navigate('/pricing')}
                    className="w-full"
                  >
                    Select a Plan
                  </PrimaryButton>

                  {/* Quick Plans Preview */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Available Plans ({availablePlans.length}):</p>
                    {availablePlans && availablePlans.length > 0 ? (
                      availablePlans.slice(0, 3).map((plan) => (
                        <div key={plan.id} className="flex justify-between items-center py-1">
                          <span>{plan.name}</span>
                          <span className="font-medium">
                            {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.duration}`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-red-500">No plans available</div>
                    )}
                  </div>
                </div>
              )}

              {user.state === 'pending_approval' && (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-600 font-medium">Waiting for admin approval</p>
                  <p className="text-sm text-gray-600">You'll be notified once approved</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Downloads */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Downloads</h3>
                <Download className="h-6 w-6 text-green-600" />
              </div>

              {canDownload ? (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Chrome Extension</h4>
                        <p className="text-sm text-gray-600">AI-powered conversation assistant</p>
                      </div>
                      <PrimaryButton
                        onClick={() => handleDownload('extension')}
                        size="sm"
                      >
                        Download
                      </PrimaryButton>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Desktop App</h4>
                        <p className="text-sm text-gray-600">Standalone application</p>
                      </div>
                      <PrimaryButton
                        onClick={() => handleDownload('desktop')}
                        size="sm"
                      >
                        Download
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Downloads Not Available</p>
                  <p className="text-sm text-gray-500">
                    {user.state === 'registered' ? 'Please select a plan first' : 'Waiting for plan approval'}
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account created</p>
                  <p className="text-xs text-gray-600">{user.createdAt?.toDate().toLocaleString() || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Last login</p>
                  <p className="text-xs text-gray-600">{user.lastLogin?.toDate().toLocaleString() || 'Unknown'}</p>
                </div>
              </div>

              {user.plan && (
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Plan selected: {user.plan}</p>
                    <p className="text-xs text-gray-600">Status: {user.state}</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
