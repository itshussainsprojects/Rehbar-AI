const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqLQN_f8hqL8c2C5bAC9jNG73X2O5kqog",
  authDomain: "rehbar-ai.firebaseapp.com",
  projectId: "rehbar-ai",
  storageBucket: "rehbar-ai.firebasestorage.app",
  messagingSenderId: "1092527887585",
  appId: "1:1092527887585:web:4c44ee8b7a2c4c8a8b5c8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Plans data
const plansData = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    price: 0,
    duration: '3 days',
    features: [
      '3-day free trial',
      'Basic AI interview assistance',
      'Voice recognition',
      'Limited daily usage',
      'Email support'
    ],
    limits: {
      meetingsPerDay: 2,
      voiceMinutesPerDay: 30,
      aiSuggestionsPerDay: 10
    },
    popular: false,
    trialDays: 3
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    duration: 'month',
    features: [
      'Unlimited AI interview assistance',
      'Advanced voice recognition',
      'Real-time suggestions',
      'Interview analytics',
      'Email support',
      'Chrome extension access'
    ],
    limits: {
      meetingsPerDay: 10,
      voiceMinutesPerDay: 120,
      aiSuggestionsPerDay: 50
    },
    popular: true,
    trialDays: 0
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 19.99,
    duration: 'month',
    features: [
      'Everything in Basic',
      'Unlimited daily usage',
      'Advanced AI models',
      'Custom interview preparation',
      'Priority support',
      'API access',
      'Team collaboration'
    ],
    limits: {
      meetingsPerDay: -1, // unlimited
      voiceMinutesPerDay: -1, // unlimited
      aiSuggestionsPerDay: -1 // unlimited
    },
    popular: false,
    trialDays: 0
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    duration: 'month',
    features: [
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Advanced analytics',
      'Multi-tenant support'
    ],
    limits: {
      meetingsPerDay: -1, // unlimited
      voiceMinutesPerDay: -1, // unlimited
      aiSuggestionsPerDay: -1 // unlimited
    },
    popular: false,
    trialDays: 0
  }
];

async function createPlansData() {
  try {
    console.log('🔧 Creating plans data in Firestore...');
    
    for (const plan of plansData) {
      await setDoc(doc(db, 'plans', plan.id), plan);
      console.log(`✅ Created plan: ${plan.name}`);
    }
    
    console.log('🎉 All plans created successfully!');
    console.log('');
    console.log('📊 Created Plans:');
    plansData.forEach(plan => {
      console.log(`• ${plan.name}: $${plan.price}/${plan.duration}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating plans:', error);
  }
}

// Run the script
createPlansData().then(() => {
  console.log('✅ Plans creation completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
