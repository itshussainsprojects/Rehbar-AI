// Deploy Firestore Rules and Initial Data
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'rehbar-ai'
});

const db = admin.firestore();

// Initial Plans Data
const initialPlans = [
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
    },
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    },
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    },
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Deploy initial plans
async function deployInitialPlans() {
  console.log('🔥 Deploying initial plans...');
  
  try {
    const batch = db.batch();
    
    for (const plan of initialPlans) {
      const planRef = db.collection('plans').doc(plan.id);
      batch.set(planRef, plan);
    }
    
    await batch.commit();
    console.log('✅ Initial plans deployed successfully');
  } catch (error) {
    console.error('❌ Error deploying plans:', error);
  }
}

// Create admin user
async function createAdminUser() {
  console.log('🔥 Creating admin user...');
  
  try {
    // Create admin user in Firebase Auth
    const adminUser = await admin.auth().createUser({
      email: 'admin@rehbar-ai.com',
      password: 'AdminRehbar2024!',
      displayName: 'Rehbar AI Admin',
      emailVerified: true
    });
    
    // Create admin profile in Firestore
    await db.collection('users').doc(adminUser.uid).set({
      uid: adminUser.uid,
      email: 'admin@rehbar-ai.com',
      displayName: 'Rehbar AI Admin',
      isAdmin: true,
      state: 'active',
      usage: {
        meetingsToday: 0,
        voiceMinutesToday: 0,
        aiSuggestionsToday: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalMeetings: 0,
        totalVoiceMinutes: 0,
        totalAiSuggestions: 0
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Admin Email: admin@rehbar-ai.com');
    console.log('🔑 Admin Password: AdminRehbar2024!');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Create indexes
async function createIndexes() {
  console.log('🔥 Creating Firestore indexes...');
  
  const indexes = [
    {
      collectionGroup: 'planApprovals',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'requestedAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'planApprovals',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'requestedAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'chatHistory',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'systemLogs',
      fields: [
        { fieldPath: 'level', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'users',
      fields: [
        { fieldPath: 'state', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ];
  
  console.log('ℹ️ Indexes need to be created manually in Firebase Console:');
  console.log('https://console.firebase.google.com/project/rehbar-ai/firestore/indexes');
  
  indexes.forEach((index, i) => {
    console.log(`\n${i + 1}. Collection: ${index.collectionGroup}`);
    console.log('   Fields:');
    index.fields.forEach(field => {
      console.log(`   - ${field.fieldPath} (${field.order})`);
    });
  });
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting Firestore deployment...\n');
  
  try {
    await deployInitialPlans();
    await createAdminUser();
    await createIndexes();
    
    console.log('\n🎉 Firestore deployment completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy Firestore rules using: firebase deploy --only firestore:rules');
    console.log('2. Create indexes manually in Firebase Console');
    console.log('3. Test user registration flow');
    console.log('4. Test admin approval workflow');
    console.log('5. Verify real-time updates');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run deployment
deploy();
