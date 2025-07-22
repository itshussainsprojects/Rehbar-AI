// Create Initial Data for Firestore
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'rehbar-ai'
  });
}

const db = admin.firestore();

// Create initial plans data
async function createInitialPlans() {
  console.log('📋 Creating initial plans...');
  
  const plans = [
    {
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
      },
      active: true,
      popular: false,
      description: 'Perfect for trying out Rehbar AI',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
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
        'Meeting transcripts',
        'Advanced analytics'
      ],
      limits: {
        meetingsPerDay: -1,
        voiceMinutesPerDay: 300,
        aiSuggestionsPerDay: 500
      },
      active: true,
      popular: true,
      description: 'Best for professionals and small teams',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
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
        'API access',
        'Priority processing',
        'Custom models'
      ],
      limits: {
        meetingsPerDay: -1,
        voiceMinutesPerDay: -1,
        aiSuggestionsPerDay: -1
      },
      active: true,
      popular: false,
      description: 'For large teams and organizations',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  try {
    const batch = db.batch();
    
    for (const plan of plans) {
      const planRef = db.collection('plans').doc();
      batch.set(planRef, plan);
    }
    
    await batch.commit();
    console.log('✅ Plans created successfully');
  } catch (error) {
    console.error('❌ Error creating plans:', error);
  }
}

// Create sample system logs
async function createSampleLogs() {
  console.log('📝 Creating sample system logs...');
  
  const logs = [
    {
      level: 'info',
      message: 'System initialized',
      action: 'system_init',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      level: 'info',
      message: 'Initial plans created',
      action: 'plans_created',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  try {
    const batch = db.batch();
    
    for (const log of logs) {
      const logRef = db.collection('systemLogs').doc();
      batch.set(logRef, log);
    }
    
    await batch.commit();
    console.log('✅ System logs created successfully');
  } catch (error) {
    console.error('❌ Error creating system logs:', error);
  }
}

// Create public data
async function createPublicData() {
  console.log('🌐 Creating public data...');
  
  const publicData = {
    appInfo: {
      name: 'Rehbar AI',
      version: '1.0.0',
      description: 'AI-powered meeting assistant',
      features: [
        'Voice recognition',
        'Real-time transcription',
        'AI suggestions',
        'Meeting summaries'
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    },
    supportInfo: {
      email: 'support@rehbar-ai.com',
      phone: '+1-555-REHBAR-AI',
      hours: 'Monday-Friday, 9 AM - 6 PM EST',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  try {
    const batch = db.batch();
    
    for (const [key, data] of Object.entries(publicData)) {
      const dataRef = db.collection('publicData').doc(key);
      batch.set(dataRef, data);
    }
    
    await batch.commit();
    console.log('✅ Public data created successfully');
  } catch (error) {
    console.error('❌ Error creating public data:', error);
  }
}

// Main function
async function createInitialData() {
  console.log('🚀 Creating initial Firestore data...\n');
  
  try {
    await createInitialPlans();
    await createSampleLogs();
    await createPublicData();
    
    console.log('\n🎉 Initial data creation completed!');
    console.log('\n📋 Created:');
    console.log('• 3 subscription plans');
    console.log('• Sample system logs');
    console.log('• Public app information');
    
    console.log('\n🔗 Next steps:');
    console.log('1. Deploy Firestore rules');
    console.log('2. Test the pricing page');
    console.log('3. Test user registration');
    console.log('4. Test plan selection');
    
  } catch (error) {
    console.error('❌ Failed to create initial data:', error);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createInitialData();
}

module.exports = {
  createInitialPlans,
  createSampleLogs,
  createPublicData,
  createInitialData
};
