const admin = require('firebase-admin');

let db;
let auth;

const initializeFirebase = () => {
  try {
    // Initialize Firebase Admin SDK with updated environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    db = admin.firestore();
    auth = admin.auth();

    // Configure Firestore settings
    db.settings({
      timestampsInSnapshots: true
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    process.exit(1);
  }
};

// Client-side Firebase configuration for frontend
const getClientConfig = () => {
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
};

// Authentication methods configuration
const getAuthMethods = () => {
  const methods = (process.env.AUTH_METHODS || 'email,google,phone').split(',');
  return {
    email: methods.includes('email'),
    google: methods.includes('google'),
    phone: methods.includes('phone'),
    googleClientId: process.env.GOOGLE_CLIENT_ID
  };
};

// Firestore helper functions
const createDocument = async (collection, data, docId = null) => {
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const docData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    let docRef;
    if (docId) {
      docRef = db.collection(collection).doc(docId);
      await docRef.set(docData);
    } else {
      docRef = await db.collection(collection).add(docData);
    }

    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error(`Error creating document in ${collection}:`, error);
    throw error;
  }
};

const getDocument = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(`Error getting document from ${collection}:`, error);
    throw error;
  }
};

const updateDocument = async (collection, docId, data) => {
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const updateData = {
      ...data,
      updatedAt: timestamp
    };

    await db.collection(collection).doc(docId).update(updateData);
    return { id: docId, ...updateData };
  } catch (error) {
    console.error(`Error updating document in ${collection}:`, error);
    throw error;
  }
};

const deleteDocument = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collection}:`, error);
    throw error;
  }
};

const queryDocuments = async (collection, filters = [], orderBy = null, limit = null) => {
  try {
    let query = db.collection(collection);

    // Apply filters
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    // Apply ordering
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents from ${collection}:`, error);
    throw error;
  }
};

// Authentication helper functions
const createUser = async (userData) => {
  try {
    // Create user with different authentication methods
    const userCreateData = {
      displayName: userData.displayName,
      disabled: false
    };

    // Handle different authentication methods
    if (userData.email && userData.password) {
      // Email/password authentication
      userCreateData.email = userData.email;
      userCreateData.password = userData.password;
      userCreateData.emailVerified = false;
    } else if (userData.email && userData.googleId) {
      // Google authentication
      userCreateData.email = userData.email;
      userCreateData.emailVerified = true;
      userCreateData.providerData = [{
        uid: userData.googleId,
        email: userData.email,
        displayName: userData.displayName,
        providerId: 'google.com'
      }];
    } else if (userData.phoneNumber) {
      // Phone authentication
      userCreateData.phoneNumber = userData.phoneNumber;
      userCreateData.emailVerified = false;
    }

    const userRecord = await auth.createUser(userCreateData);

    // Create user document in Firestore with authentication method info
    const userDocData = {
      uid: userRecord.uid,
      displayName: userData.displayName,
      subscriptionTier: 'trial',
      trialStartDate: admin.firestore.FieldValue.serverTimestamp(),
      trialEndDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + (parseInt(process.env.TRIAL_PERIOD_DAYS) || 3) * 24 * 60 * 60 * 1000)
      ),
      dailyRequestCount: 0,
      lastRequestDate: null,
      isActive: true,
      preferences: {
        voiceSpeed: 1.0,
        voicePitch: 1.0,
        preferredVoice: 'default',
        language: 'en',
        theme: 'light', // Changed to light theme as per user preference
        notificationsEnabled: true
      }
    };

    // Add authentication method specific data
    if (userData.email) {
      userDocData.email = userData.email;
      userDocData.authMethod = userData.googleId ? 'google' : 'email';
      userDocData.emailVerified = userData.googleId ? true : false;
    }

    if (userData.phoneNumber) {
      userDocData.phoneNumber = userData.phoneNumber;
      userDocData.authMethod = 'phone';
      userDocData.phoneVerified = true;
    }

    if (userData.googleId) {
      userDocData.googleId = userData.googleId;
      userDocData.profilePicture = userData.profilePicture;
    }

    const userDoc = await createDocument('users', userDocData, userRecord.uid);

    return { ...userRecord, ...userDoc };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await getDocument('users', userRecord.uid);
    return { ...userRecord, ...userDoc };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

const getUserById = async (uid) => {
  try {
    const userRecord = await auth.getUser(uid);
    const userDoc = await getDocument('users', uid);
    return { ...userRecord, ...userDoc };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

const updateUserPassword = async (uid, newPassword) => {
  try {
    await auth.updateUser(uid, { password: newPassword });
    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
    await deleteDocument('users', uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Subscription helper functions
const updateUserSubscription = async (uid, subscriptionData) => {
  try {
    return await updateDocument('users', uid, {
      subscriptionTier: subscriptionData.tier,
      subscriptionId: subscriptionData.subscriptionId,
      subscriptionStatus: subscriptionData.status,
      subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionEndDate: subscriptionData.endDate,
      dailyRequestCount: 0
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

const checkUserLimits = async (uid) => {
  try {
    const user = await getUserById(uid);
    if (!user) return { allowed: false, reason: 'User not found' };

    const now = new Date();
    const today = now.toDateString();
    const lastRequestDate = user.lastRequestDate?.toDate?.()?.toDateString();

    // Reset daily count if it's a new day
    if (lastRequestDate !== today) {
      await updateDocument('users', uid, {
        dailyRequestCount: 0,
        lastRequestDate: admin.firestore.FieldValue.serverTimestamp()
      });
      user.dailyRequestCount = 0;
    }

    // Check subscription status
    if (user.subscriptionTier === 'trial') {
      const trialEndDate = user.trialEndDate?.toDate();
      if (trialEndDate && now > trialEndDate) {
        return { allowed: false, reason: 'Trial period expired' };
      }
    }

    // Check daily limits
    const limits = {
      trial: parseInt(process.env.FREE_DAILY_REQUESTS) || 50,
      pro: parseInt(process.env.PRO_DAILY_REQUESTS) || 1000,
      premium: parseInt(process.env.PREMIUM_DAILY_REQUESTS) || 5000
    };

    const userLimit = limits[user.subscriptionTier] || limits.trial;
    if (user.dailyRequestCount >= userLimit) {
      return { allowed: false, reason: 'Daily limit exceeded' };
    }

    return { allowed: true, remaining: userLimit - user.dailyRequestCount };
  } catch (error) {
    console.error('Error checking user limits:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
};

const incrementUserRequestCount = async (uid) => {
  try {
    await db.collection('users').doc(uid).update({
      dailyRequestCount: admin.firestore.FieldValue.increment(1),
      lastRequestDate: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing user request count:', error);
    throw error;
  }
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number,
      emailVerified: decodedToken.email_verified,
      authMethod: decodedToken.firebase.sign_in_provider
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle Google authentication
const handleGoogleAuth = async (googleToken, userData) => {
  try {
    // Check if user already exists
    let existingUser = null;
    if (userData.email) {
      existingUser = await getUserByEmail(userData.email);
    }

    if (existingUser) {
      // Update existing user with Google info
      await updateDocument('users', existingUser.uid, {
        googleId: userData.googleId,
        profilePicture: userData.profilePicture,
        authMethod: 'google',
        emailVerified: true
      });

      return {
        success: true,
        user: existingUser,
        message: 'Google authentication successful'
      };
    } else {
      // Create new user
      const user = await createUser({
        email: userData.email,
        displayName: userData.displayName,
        googleId: userData.googleId,
        profilePicture: userData.profilePicture
      });

      return {
        success: true,
        user: user.user,
        message: 'Google authentication successful'
      };
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle phone authentication
const handlePhoneAuth = async (phoneNumber, displayName) => {
  try {
    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await getUserByPhone(phoneNumber);
    } catch (error) {
      // User doesn't exist, will create new one
    }

    if (existingUser) {
      return {
        success: true,
        user: existingUser,
        message: 'Phone authentication successful'
      };
    } else {
      // Create new user
      const user = await createUser({
        phoneNumber: phoneNumber,
        displayName: displayName || `User ${phoneNumber.slice(-4)}`
      });

      return {
        success: true,
        user: user.user,
        message: 'Phone authentication successful'
      };
    }
  } catch (error) {
    console.error('Phone auth error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user by phone number
const getUserByPhone = async (phoneNumber) => {
  try {
    const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    const userDoc = await getDocument('users', userRecord.uid);

    return userDoc ? { ...userDoc, uid: userRecord.uid } : null;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

module.exports = {
  // Core functions
  initializeFirebase,
  db,
  auth,
  admin,

  // Database functions
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,

  // Authentication functions
  createUser,
  getUserByEmail,
  getUserById,
  getUserByPhone,
  updateUserPassword,
  deleteUser,
  verifyIdToken,
  handleGoogleAuth,
  handlePhoneAuth,

  // Subscription functions
  updateUserSubscription,
  checkUserLimits,
  incrementUserRequestCount,

  // Configuration functions
  getClientConfig,
  getAuthMethods
};
