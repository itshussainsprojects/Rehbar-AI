const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { 
  updateDocument, 
  createDocument, 
  getDocument,
  queryDocuments 
} = require('../config/firebase');

const router = express.Router();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro Plan',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      '1,000 daily AI requests',
      'Advanced voice features',
      'Priority support',
      'Chrome extension access',
      'Desktop app access'
    ],
    stripePriceId: 'price_pro_monthly' // Replace with actual Stripe price ID
  },
  premium: {
    name: 'Premium Plan',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      '5,000 daily AI requests',
      'All Pro features',
      'Custom AI personalities',
      'Advanced analytics',
      'API access',
      'White-label options'
    ],
    stripePriceId: 'price_premium_monthly' // Replace with actual Stripe price ID
  }
};

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Private
router.get('/plans', async (req, res) => {
  try {
    const user = req.user;
    const currentPlan = user.subscriptionTier || 'trial';

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (currentPlan === 'trial' && user.trialEndDate) {
      const trialEnd = user.trialEndDate.toDate();
      const now = new Date();
      const diffTime = trialEnd - now;
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
      isCurrentPlan: currentPlan === key,
      canUpgrade: currentPlan === 'trial' || (currentPlan === 'pro' && key === 'premium')
    }));

    res.json({
      success: true,
      data: {
        plans,
        currentPlan: {
          tier: currentPlan,
          trialDaysRemaining,
          subscriptionStatus: user.subscriptionStatus || 'active'
        }
      }
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription plans',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/subscriptions/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout-session', [
  body('planId')
    .isIn(['pro', 'premium'])
    .withMessage('Invalid plan ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { planId } = req.body;
    const userId = req.userId;
    const user = req.user;

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan',
        message: 'The selected plan does not exist'
      });
    }

    // Check if user can upgrade to this plan
    const currentTier = user.subscriptionTier || 'trial';
    if (currentTier === 'premium' || (currentTier === 'pro' && planId === 'pro')) {
      return res.status(400).json({
        success: false,
        error: 'Cannot downgrade',
        message: 'You cannot downgrade your current subscription'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId,
        planId
      },
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      }
    });

    // Save checkout session info
    await createDocument('checkoutSessions', {
      sessionId: session.id,
      userId,
      planId,
      status: 'pending',
      amount: plan.price * 100, // Convert to cents
      currency: plan.currency
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

// Handle successful checkout
const handleCheckoutCompleted = async (session) => {
  const userId = session.metadata.userId;
  const planId = session.metadata.planId;
  
  if (!userId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update user subscription
  await updateDocument('users', userId, {
    subscriptionTier: planId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionStartDate: new Date(subscription.current_period_start * 1000),
    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    customerId: session.customer,
    dailyRequestCount: 0 // Reset daily count
  });

  // Update checkout session
  const sessions = await queryDocuments('checkoutSessions', [
    { field: 'sessionId', operator: '==', value: session.id }
  ]);

  if (sessions.length > 0) {
    await updateDocument('checkoutSessions', sessions[0].id, {
      status: 'completed',
      subscriptionId: subscription.id
    });
  }

  // Create subscription record
  await createDocument('subscriptions', {
    userId,
    subscriptionId: subscription.id,
    planId,
    status: subscription.status,
    customerId: session.customer,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });

  console.log(`Subscription activated for user ${userId}: ${planId}`);
};

// Handle subscription updates
const handleSubscriptionUpdated = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  await updateDocument('users', userId, {
    subscriptionStatus: subscription.status,
    subscriptionEndDate: new Date(subscription.current_period_end * 1000)
  });

  // Update subscription record
  const subscriptions = await queryDocuments('subscriptions', [
    { field: 'subscriptionId', operator: '==', value: subscription.id }
  ]);

  if (subscriptions.length > 0) {
    await updateDocument('subscriptions', subscriptions[0].id, {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
  }
};

// Handle subscription cancellation
const handleSubscriptionDeleted = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  await updateDocument('users', userId, {
    subscriptionTier: 'trial',
    subscriptionStatus: 'canceled',
    subscriptionEndDate: new Date(),
    dailyRequestCount: 0
  });

  // Update subscription record
  const subscriptions = await queryDocuments('subscriptions', [
    { field: 'subscriptionId', operator: '==', value: subscription.id }
  ]);

  if (subscriptions.length > 0) {
    await updateDocument('subscriptions', subscriptions[0].id, {
      status: 'canceled',
      canceledAt: new Date()
    });
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (invoice) => {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;
  
  if (!userId) return;

  // Create payment record
  await createDocument('payments', {
    userId,
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    paidAt: new Date(invoice.status_transitions.paid_at * 1000)
  });

  console.log(`Payment succeeded for user ${userId}: $${invoice.amount_paid / 100}`);
};

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;
  
  if (!userId) return;

  // Create payment record
  await createDocument('payments', {
    userId,
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    failedAt: new Date()
  });

  console.log(`Payment failed for user ${userId}: $${invoice.amount_due / 100}`);
};

// @route   GET /api/subscriptions/status
// @desc    Get current subscription status
// @access  Private
router.get('/status', async (req, res) => {
  try {
    const user = req.user;
    const userId = req.userId;

    // Get subscription details
    let subscriptionDetails = null;
    if (user.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        };
      } catch (error) {
        console.error('Error retrieving subscription from Stripe:', error);
      }
    }

    // Get payment history
    const payments = await queryDocuments('payments', [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'createdAt', direction: 'desc' }, 10);

    res.json({
      success: true,
      data: {
        currentTier: user.subscriptionTier || 'trial',
        status: user.subscriptionStatus || 'active',
        subscription: subscriptionDetails,
        usage: {
          dailyRequests: user.dailyRequestCount || 0,
          lastRequestDate: user.lastRequestDate
        },
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          date: payment.paidAt || payment.failedAt || payment.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription',
        message: 'You do not have an active subscription to cancel'
      });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    });

    await updateDocument('users', req.userId, {
      subscriptionStatus: 'canceling'
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      data: {
        cancelAt: new Date(subscription.current_period_end * 1000)
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
