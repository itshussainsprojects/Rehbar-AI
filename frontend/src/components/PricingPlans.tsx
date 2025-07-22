import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, ArrowRight, Loader } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  limits: {
    meetingsPerDay: string | number;
    voiceMinutesPerDay: string | number;
    aiSuggestionsPerDay: string | number;
    teamMembers?: string | number;
  };
}

interface PlansData {
  FREE: Plan;
  PRO: Plan;
  PREMIUM: Plan;
}

const PricingPlans: React.FC = () => {
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/plans');
      const result = await response.json();

      if (result.success) {
        setPlans(result.data.plans);
      } else {
        setError('Failed to load plans');
      }
    } catch (err) {
      console.error('Server connection error:', err);
      // Provide fallback plans data when server is not available
      const fallbackPlans = {
        FREE: {
          id: 'free',
          name: 'Free Trial',
          price: 0,
          duration: '3 days',
          features: [
            'Chrome Extension Access',
            'Basic AI Suggestions',
            'Google Meet Support',
            'Limited Voice Recognition'
          ],
          limits: {
            meetingsPerDay: 3,
            voiceMinutesPerDay: 30,
            aiSuggestionsPerDay: 50
          }
        },
        PRO: {
          id: 'pro',
          name: 'Professional',
          price: 29,
          duration: 'monthly',
          features: [
            'All Free Features',
            'Advanced AI Suggestions',
            'All Meeting Platforms',
            'Unlimited Voice Recognition',
            'Desktop App Access',
            'Priority Support'
          ],
          limits: {
            meetingsPerDay: 'unlimited',
            voiceMinutesPerDay: 'unlimited',
            aiSuggestionsPerDay: 'unlimited'
          }
        },
        PREMIUM: {
          id: 'premium',
          name: 'Premium Enterprise',
          price: 99,
          duration: 'monthly',
          features: [
            'All Pro Features',
            'Custom AI Training',
            'Team Management',
            'Analytics Dashboard',
            'API Access',
            'White-label Options',
            'Dedicated Support'
          ],
          limits: {
            meetingsPerDay: 'unlimited',
            voiceMinutesPerDay: 'unlimited',
            aiSuggestionsPerDay: 'unlimited',
            teamMembers: 'unlimited'
          }
        }
      };

      setPlans(fallbackPlans);
      setError('Using offline mode - server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (planId: string) => {
    setSelecting(planId);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please log in first to select a plan.');
        window.location.href = '/auth';
        return;
      }

      const response = await fetch('http://localhost:3001/api/user/select-plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      const result = await response.json();

      if (result.success) {
        // Show success message and redirect to dashboard
        alert('Plan selected successfully! Your request has been sent for admin approval.');
        window.location.href = '/dashboard';
      } else {
        if (result.error === 'Invalid token' || result.error === 'Authorization token required') {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          window.location.href = '/auth';
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Plan selection error:', err);
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setSelecting(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-8 w-8" />;
      case 'pro':
        return <Zap className="h-8 w-8" />;
      case 'premium':
        return <Crown className="h-8 w-8" />;
      default:
        return <Star className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-green-400 to-green-600';
      case 'pro':
        return 'from-blue-400 to-blue-600';
      case 'premium':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const formatLimit = (limit: string | number) => {
    return limit === 'unlimited' ? '∞' : limit.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error && !plans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPlans}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-blue-600">Rehbar AI</span> Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your meeting needs. All plans include our core AI features 
            with different usage limits and advanced capabilities.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-md mx-auto"
          >
            <p className="text-red-600 text-center">{error}</p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans && Object.entries(plans).map(([key, plan], index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.id === 'pro' ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`bg-gradient-to-r ${getPlanColor(plan.id)} p-6 text-white ${
                plan.id === 'pro' ? 'pt-12' : ''
              }`}>
                <div className="flex items-center justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                <div className="text-center">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-lg opacity-90">/{plan.duration}</span>
                </div>
              </div>

              <div className="p-6">
                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Usage Limits:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Meetings/day:</span>
                      <span className="font-medium">{formatLimit(plan.limits.meetingsPerDay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voice minutes/day:</span>
                      <span className="font-medium">{formatLimit(plan.limits.voiceMinutesPerDay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI suggestions/day:</span>
                      <span className="font-medium">{formatLimit(plan.limits.aiSuggestionsPerDay)}</span>
                    </div>
                    {plan.limits.teamMembers && (
                      <div className="flex justify-between">
                        <span>Team members:</span>
                        <span className="font-medium">{formatLimit(plan.limits.teamMembers)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={selecting === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    plan.id === 'pro'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } ${selecting === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selecting === plan.id ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Selecting...
                    </>
                  ) : (
                    <>
                      Select {plan.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What happens after you select a plan?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Plan Selection</h4>
                <p className="text-gray-600 text-sm">Choose your preferred plan and submit your request</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Admin Approval</h4>
                <p className="text-gray-600 text-sm">Our team reviews and approves your plan request</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Start Using</h4>
                <p className="text-gray-600 text-sm">Download the extension and desktop app to get started</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPlans;
