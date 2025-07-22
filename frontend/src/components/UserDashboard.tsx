import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Download, Clock, CheckCircle, XCircle, AlertCircle, History, MessageSquare } from 'lucide-react';
import { auth } from '../config/firebase';
import { userProfileService, planService, chatService, realtimeService, UserProfile, PlanDetails, ChatHistory } from '../services/firestore';

interface DashboardData {
  user: UserProfile;
  availablePlans: PlanDetails[];
  canSelectPlan: boolean;
  canDownload: boolean;
  chatHistory: ChatHistory[];
}

const UserDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [requestingPlan, setRequestingPlan] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time listeners
    const currentUser = auth.currentUser;
    if (currentUser) {
      const unsubscribeProfile = realtimeService.subscribeToUserProfile(
        currentUser.uid,
        (profile) => {
          if (profile && dashboardData) {
            setDashboardData(prev => prev ? { ...prev, user: profile } : null);
          }
        }
      );

      const unsubscribeApproval = realtimeService.subscribeToPlanApproval(
        currentUser.uid,
        (approval) => {
          // Handle approval status changes
          if (approval && dashboardData) {
            console.log('Plan approval status updated:', approval.status);
          }
        }
      );

      return () => {
        unsubscribeProfile();
        unsubscribeApproval();
      };
    }
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        window.location.href = '/auth';
        return;
      }

      console.log('Fetching dashboard data for user:', currentUser.uid);

      // Check if user profile exists, if not create it
      let userProfile = await userProfileService.getUserProfile(currentUser.uid);
      if (!userProfile) {
        console.log('Creating new user profile...');
        // Create user profile from Firebase Auth data
        const profileData: any = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        };

        // Only add optional fields if they exist
        if (currentUser.photoURL) {
          profileData.profilePicture = currentUser.photoURL;
        }
        if (currentUser.phoneNumber) {
          profileData.phoneNumber = currentUser.phoneNumber;
        }

        await userProfileService.createUserProfile(profileData);

        // Fetch the newly created profile
        userProfile = await userProfileService.getUserProfile(currentUser.uid);
        if (!userProfile) {
          throw new Error('Failed to create user profile');
        }
      }

      // Fetch available plans
      const availablePlans = await planService.getAvailablePlans();

      // Fetch chat history
      const chatHistory = await chatService.getUserChatHistory(currentUser.uid, 10);

      // Determine permissions
      const canSelectPlan = userProfile.state === 'registered' || userProfile.state === 'rejected';
      const canDownload = userProfile.state === 'approved' || userProfile.state === 'active';

      setDashboardData({
        user: userProfile,
        availablePlans,
        canSelectPlan,
        canDownload,
        chatHistory
      });

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStateDisplay = (state: string) => {
    switch (state) {
      case 'registered':
        return { text: 'Welcome! Please select a plan', color: 'text-blue-600', icon: AlertCircle };
      case 'plan_selected':
        return { text: 'Plan selected', color: 'text-yellow-600', icon: Clock };
      case 'pending_approval':
        return { text: 'Waiting for approval', color: 'text-yellow-600', icon: Clock };
      case 'approved':
        return { text: 'Approved! You can now download', color: 'text-green-600', icon: CheckCircle };
      case 'active':
        return { text: 'Active user', color: 'text-green-600', icon: CheckCircle };
      case 'rejected':
        return { text: 'Plan rejected. Please select another plan', color: 'text-red-600', icon: XCircle };
      default:
        return { text: state, color: 'text-gray-600', icon: AlertCircle };
    }
  };

  const handlePlanSelection = async (planId: string) => {
    if (!auth.currentUser) return;

    setRequestingPlan(true);
    try {
      await planService.requestPlanApproval(auth.currentUser.uid, planId);

      // Refresh dashboard data
      await fetchDashboardData();

      alert('Plan request submitted successfully! Please wait for admin approval.');
    } catch (error) {
      console.error('Error requesting plan:', error);
      alert('Failed to request plan. Please try again.');
    } finally {
      setRequestingPlan(false);
    }
  };

  const handlePlanModal = () => {
    setSelectedPlan('modal');
  };

  const handleDownload = (type: 'extension' | 'desktop') => {
    // TODO: Implement download logic based on user's plan
    if (type === 'extension') {
      // Download Chrome extension
      const link = document.createElement('a');
      link.href = '/downloads/rehbar-ai-extension.zip';
      link.download = 'rehbar-ai-extension.zip';
      link.click();
    } else {
      // Download desktop app
      const link = document.createElement('a');
      link.href = '/downloads/rehbar-ai-desktop.zip';
      link.download = 'rehbar-ai-desktop.zip';
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, availablePlans, canSelectPlan, canDownload } = dashboardData;
  const stateDisplay = getStateDisplay(user.state);
  const StateIcon = stateDisplay.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center space-x-2 ${stateDisplay.color}`}>
                <StateIcon className="h-5 w-5" />
                <span className="font-medium">{stateDisplay.text}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                Your Plan Status
              </h2>

              {user.plan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-blue-900">{user.planDetails?.name}</h3>
                      <p className="text-blue-700">${user.planDetails?.price}/{user.planDetails?.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Status: {user.state}</p>
                      {user.approvedAt && (
                        <p className="text-xs text-blue-500">
                          Approved: {new Date(user.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {user.planDetails?.features && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Plan Features:</h4>
                      <ul className="space-y-1">
                        {user.planDetails.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Plan Selected</h3>
                  <p className="text-gray-600 mb-4">Choose a plan to get started with Rehbar AI</p>
                  {canSelectPlan && (
                    <button
                      onClick={handlePlanModal}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select a Plan
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Chat History */}
            {dashboardData.chatHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 text-purple-600 mr-2" />
                  Recent Chat History
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dashboardData.chatHistory.slice(0, 5).map((chat) => (
                    <div key={chat.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Session {chat.sessionId.slice(-8)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {chat.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {chat.messages.length} messages
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => window.location.href = '/history'}
                  className="mt-4 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center"
                >
                  <History className="h-4 w-4 mr-2" />
                  View Full History
                </button>
              </motion.div>
            )}

            {/* Usage Statistics */}
            {user.plan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user.usage.meetingsToday}</div>
                    <div className="text-sm text-green-700">Meetings</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user.usage.voiceMinutesToday}</div>
                    <div className="text-sm text-blue-700">Voice Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user.usage.aiSuggestionsToday}</div>
                    <div className="text-sm text-purple-700">AI Suggestions</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Downloads */}
            {canDownload && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Download className="h-6 w-6 text-green-600 mr-2" />
                  Downloads
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload('extension')}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Chrome Extension
                  </button>
                  <button
                    onClick={() => handleDownload('desktop')}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Desktop App
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Downloads are available based on your approved plan
                </p>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {canSelectPlan && (
                  <button
                    onClick={handlePlanSelection}
                    className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Select Plan
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/support'}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Get Support
                </button>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {selectedPlan === 'modal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Select Your Plan</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.availablePlans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-blue-600">${plan.price}</span>
                        <span className="text-gray-600">/{plan.duration}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="text-xs text-gray-500 mb-4">
                      <p>Limits:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• {plan.limits.meetingsPerDay} meetings/day</li>
                        <li>• {plan.limits.voiceMinutesPerDay} voice minutes/day</li>
                        <li>• {plan.limits.aiSuggestionsPerDay} AI suggestions/day</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={requestingPlan}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {requestingPlan ? 'Requesting...' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
