// Firebase Configuration for Frontend
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAITbMOcZevblT8jplT5A2ayRZmHzn1nto",
  authDomain: "rehbar-ai.firebaseapp.com",
  projectId: "rehbar-ai",
  storageBucket: "rehbar-ai.firebasestorage.app",
  messagingSenderId: "340773192880",
  appId: "1:340773192880:web:dcab9294fa24e56b276775"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Authentication methods
export const authMethods = {
  email: true,
  google: true,
  phone: true
};

// Email/Password Authentication
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    console.log('🔐 Creating Firebase user account for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    console.log('✅ Firebase user created:', userCredential.user.uid);
    console.log('✅ User email verified:', userCredential.user.emailVerified);

    // Update user profile
    await userCredential.user.updateProfile({
      displayName: displayName
    });

    console.log('📝 Creating Firestore user profile...');

    // Create user profile in Firestore (with error handling)
    try {
      const { userProfileService } = await import('../services/firestore');
      const profileData: any = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName
      };

      // Only add optional fields if they exist
      if (userCredential.user.photoURL) {
        profileData.profilePicture = userCredential.user.photoURL;
      }
      if (userCredential.user.phoneNumber) {
        profileData.phoneNumber = userCredential.user.phoneNumber;
      }

      await userProfileService.createUserProfile(profileData);
      console.log('✅ User profile created in Firestore');
    } catch (firestoreError) {
      console.warn('⚠️ Failed to create user profile in Firestore:', firestoreError);
      // Don't fail the signup if Firestore fails - user is still created in Firebase Auth
    }

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    console.error('❌ Email signup error:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Registration failed. Please try again.';

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Generate device fingerprint for security
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')

  return btoa(fingerprint).substring(0, 32)
}

// Session heartbeat to maintain web session
let sessionHeartbeatInterval: NodeJS.Timeout | null = null

const startSessionHeartbeat = (sessionId: string) => {
  // Clear existing interval
  if (sessionHeartbeatInterval) {
    clearInterval(sessionHeartbeatInterval)
  }

  // Update session every 5 minutes
  sessionHeartbeatInterval = setInterval(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch('/api/auth/session/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      })
    } catch (error) {
      console.warn('Session heartbeat failed:', error)
    }
  }, 5 * 60 * 1000) // 5 minutes
}

// Notify Chrome extension of successful authentication
const notifyExtensionAuth = async (authData: any) => {
  try {
    // Check if extension is installed
    const extensionId = 'your-extension-id'; // Replace with actual extension ID

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(extensionId, {
        action: 'authSuccess',
        token: authData.token,
        user: authData.user,
        sessionId: authData.sessionId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Extension not available:', chrome.runtime.lastError.message);
        } else {
          console.log('✅ Extension notified of authentication');
        }
      });
    }
  } catch (error) {
    console.log('Extension communication not available:', error);
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('🔐 Signing in with email...');

    // Check network connectivity first
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Firebase sign-in successful:', user.uid);

    // Update last login in Firestore (optional)
    try {
      const { userProfileService } = await import('../services/firestore');
      await userProfileService.updateUserProfile(user.uid, {
        lastLogin: new Date() as any
      });
      console.log('✅ Last login updated in Firestore');
    } catch (firestoreError) {
      console.warn('⚠️ Failed to update last login in Firestore:', firestoreError);
      // Don't fail the login if Firestore update fails
    }

    // Store user info locally
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));

    return {
      success: true,
      user: user
    };

  } catch (error: any) {
    console.error('❌ Email signin error:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Sign-in failed. Please try again.';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please register first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Google Authentication (Direct Firebase - No Backend)
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google authentication...');

    // Check network connectivity first
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('✅ Google authentication successful:', user.uid);

    // Check if user profile exists, if not create it
    try {
      const { userProfileService } = await import('../services/firestore');
      let userProfile = await userProfileService.getUserProfile(user.uid);

      if (!userProfile) {
        // Create new user profile
        const profileData: any = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User'
        };

        // Only add optional fields if they exist
        if (user.photoURL) {
          profileData.profilePicture = user.photoURL;
        }
        if (user.phoneNumber) {
          profileData.phoneNumber = user.phoneNumber;
        }

        await userProfileService.createUserProfile(profileData);
        console.log('✅ New user profile created');
      } else {
        // Update last login
        await userProfileService.updateUserProfile(user.uid, {
          lastLogin: new Date() as any
        });
        console.log('✅ User profile updated');
      }
    } catch (firestoreError) {
      console.warn('⚠️ Firestore operation failed:', firestoreError);
      // Continue anyway - user is authenticated
    }

    // Store basic user info locally
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));

    return {
      success: true,
      user: user
    };

  } catch (error: any) {
    console.error('❌ Google signin error:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Google sign-in failed. Please try again.';

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.message.includes('offline')) {
      errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
    } else if (error.message.includes('Failed to get document')) {
      errorMessage = 'Database connection failed. Please check your internet connection and try again.';
    } else if (error.message.includes('No internet connection')) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Phone Authentication
export const signInWithPhone = async (phoneNumber: string, displayName?: string) => {
  try {
    // Create reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      }
    });

    // Send verification code
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    return {
      success: true,
      confirmationResult,
      message: 'Verification code sent to your phone'
    };
  } catch (error: any) {
    console.error('Phone signin error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyPhoneCode = async (confirmationResult: any, code: string, phoneNumber: string, displayName?: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://localhost:3001/api/auth/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        phoneNumber,
        displayName
      })
    });

    const backendResult = await response.json();
    
    if (!backendResult.success) {
      throw new Error(backendResult.error || 'Phone authentication failed');
    }

    return {
      success: true,
      user: user,
      token: backendResult.data.token,
      refreshToken: backendResult.data.refreshToken
    };
  } catch (error: any) {
    console.error('Phone verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Enhanced sign out with session cleanup
export const signOutUser = async () => {
  try {
    const sessionId = localStorage.getItem('sessionId')
    const token = localStorage.getItem('token')

    // Clear session heartbeat
    if (sessionHeartbeatInterval) {
      clearInterval(sessionHeartbeatInterval)
      sessionHeartbeatInterval = null
    }

    // Call backend logout with session info
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
      } catch (error) {
        console.warn('Backend logout failed:', error)
      }
    }

    // Firebase sign out
    await signOut(auth);

    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceFingerprint');

    console.log('✅ Complete logout successful');

    return { success: true };
  } catch (error: any) {
    console.error('❌ Signout error:', error);

    // Clear local data even if logout fails
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceFingerprint');

    return {
      success: false,
      error: error.message
    };
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user token
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Refresh token
export const refreshAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(true); // Force refresh
  }
  return null;
};

export default app;
