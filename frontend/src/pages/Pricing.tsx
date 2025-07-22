import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { planService, userProfileService, PlanDetails } from '../services/firestore';

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null); // Track which plan is being requested
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchPlans();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔐 Auth state changed:', currentUser ? currentUser.uid : 'No user');
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('🔍 Fetching plans from Firestore...');

      // Start with default plans as fallback
      let finalPlans = getDefaultPlans();
      console.log('📋 Starting with default plans:', finalPlans.length, 'plans');

      try {
        const firestorePlans = await planService.getAvailablePlans();
        console.log('📋 Firestore plans result:', firestorePlans);

        if (firestorePlans && firestorePlans.length > 0) {
          // Convert Firestore plans to match our format
          finalPlans = firestorePlans.map(plan => ({
            ...plan,
            popular: plan.popular || false,
            trialDays: plan.trialDays || 0
          }));
          console.log('✅ Using Firestore plans:', finalPlans.length, 'plans');
        } else {
          console.log('📝 No plans in Firestore, using default plans directly...');
          // Don't try to create in Firestore, just use defaults
          console.log('✅ Using default plans:', finalPlans.length, 'plans');
        }
      } catch (firestoreError) {
        console.error('❌ Firestore error:', firestoreError);
        console.log('📋 Using fallback default plans due to error');
      }

      console.log('📋 Final plans to display:', finalPlans);
      setPlans(finalPlans);

    } catch (error) {
      console.error('❌ Critical error in fetchPlans:', error);
      // Ultimate fallback
      const fallbackPlans = getDefaultPlans();
      console.log('📋 Using ultimate fallback plans:', fallbackPlans.length, 'plans');
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

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

  const getDefaultPlans = (): PlanDetails[] => [
    {
      id: 'free-trial',
      name: 'Free Trial',
      price: 0,
      duration: '3 days',
      features: [
        'Basic AI assistance',
        '5 meetings per day',
        '30 voice minutes per day',
        '50 AI suggestions per day',
        'Email support'
      ],
      limits: {
        meetingsPerDay: 5,
        voiceMinutesPerDay: 30,
        aiSuggestionsPerDay: 50
      }
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      duration: 'month',
      features: [
        'Advanced AI assistance',
        'Unlimited meetings',
        '300 voice minutes per day',
        '500 AI suggestions per day',
        'Priority support',
        'Chrome extension',
        'Meeting transcripts'
      ],
      limits: {
        meetingsPerDay: -1,
        voiceMinutesPerDay: 300,
        aiSuggestionsPerDay: 500
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      duration: 'month',
      features: [
        'Premium AI assistance',
        'Unlimited everything',
        'Custom integrations',
        'Dedicated support',
        'Team management',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ],
      limits: {
        meetingsPerDay: -1,
        voiceMinutesPerDay: -1,
        aiSuggestionsPerDay: -1
      }
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    // Prevent multiple clicks for the same plan
    if (requesting === planId) {
      console.log('⚠️ Plan request already in progress for:', planId);
      return;
    }

    // Prevent any other plan requests while one is processing
    if (requesting) {
      console.log('⚠️ Another plan request in progress, ignoring click for:', planId);
      return;
    }

    console.log('🔄 Starting plan selection for:', planId);

    if (!user) {
      console.log('❌ No user found, redirecting to auth');
      alert('Please sign in to select a plan');
      window.location.href = '/auth';
      return;
    }

    console.log('👤 User found:', user.uid, user.email);

    setRequesting(planId); // Set the specific plan being requested
    try {
      console.log('📝 Requesting plan approval for:', planId);
      const approvalId = await planService.requestPlanApproval(user.uid, planId);
      console.log('✅ Plan request successful, approval ID:', approvalId);

      alert('Plan request submitted successfully! Please wait for admin approval.');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('❌ Error requesting plan:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        planId: planId,
        userId: user?.uid
      });

      let errorMessage = 'Failed to request plan. Please try again.';

      if (error.message?.includes('User or plan not found')) {
        errorMessage = 'User or plan information not found. Please try signing out and back in.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please check your account status.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      }

      alert(errorMessage);
    } finally {
      setRequesting(null); // Clear the requesting state
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return <Sparkles className="h-8 w-8 text-blue-500" />;
      case 'professional':
        return <Zap className="h-8 w-8 text-purple-500" />;
      case 'enterprise':
        return <Shield className="h-8 w-8 text-gold-500" />;
      default:
        return <Star className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return 'from-blue-500 to-cyan-500';
      case 'professional':
        return 'from-purple-500 to-pink-500';
      case 'enterprise':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const isPopular = (planName: string) => {
    return planName.toLowerCase() === 'professional';
  };

  if (loading) {
    console.log('🔄 Pricing page is in loading state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
          <p className="text-sm text-gray-500 mt-2">Check console for debugging info</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Pricing page rendering with plans:', plans.length, 'plans');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">AI Assistant</span> Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the power of AI-driven productivity with our flexible pricing plans. 
            Start with a free trial and upgrade as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {console.log('🎨 Rendering plans in UI:', plans.length, 'plans')}
          {plans && plans.length > 0 ? (
            plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                isPopular(plan.name) ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular(plan.name) && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Daily Limits
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Meetings:</span>
                      <span className="font-medium">
                        {plan.limits.meetingsPerDay === -1 ? 'Unlimited' : plan.limits.meetingsPerDay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voice Minutes:</span>
                      <span className="font-medium">
                        {plan.limits.voiceMinutesPerDay === -1 ? 'Unlimited' : plan.limits.voiceMinutesPerDay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Suggestions:</span>
                      <span className="font-medium">
                        {plan.limits.aiSuggestionsPerDay === -1 ? 'Unlimited' : plan.limits.aiSuggestionsPerDay}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Button clicked for plan:', plan.id, plan.name);
                    handlePlanSelection(plan.id);
                  }}
                  disabled={requesting === plan.id || requesting !== null}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                    isPopular(plan.name)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
                  } ${requesting === plan.id || requesting !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {requesting === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : requesting !== null ? (
                    <>
                      {plan.price === 0 ? 'Start Free Trial' : 'Request Plan'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  ) : (
                    <>
                      {plan.price === 0 ? 'Start Free Trial' : 'Request Plan'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 text-lg font-semibold">
                No plans available ({plans.length} plans loaded)
              </div>
              <p className="text-gray-600 mt-2">
                Please check the console for debugging information.
              </p>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">How does the approval process work?</h3>
              <p className="text-gray-600">After selecting a plan, your request will be reviewed by our admin team. You'll receive an email notification once approved.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Can I change plans later?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Contact support for assistance with plan changes.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">What happens after the free trial?</h3>
              <p className="text-gray-600">Your free trial lasts 3 days. After that, you'll need to select a paid plan to continue using the service.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Is there a refund policy?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Need Help Choosing?</h3>
            <p className="text-blue-100 mb-6">Our team is here to help you find the perfect plan for your needs.</p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
