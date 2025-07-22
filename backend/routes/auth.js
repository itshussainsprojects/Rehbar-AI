const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByPhone,
  updateDocument,
  createDocument,
  verifyIdToken,
  handleGoogleAuth,
  handlePhoneAuth,
  getClientConfig,
  getAuthMethods
} = require('../config/firebase');

const { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authMiddleware 
} = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

// @route   GET /api/auth/config
// @desc    Get Firebase client configuration and auth methods
// @access  Public
router.get('/config', async (req, res) => {
  try {
    const clientConfig = getClientConfig();
    const authMethods = getAuthMethods();

    res.json({
      success: true,
      data: {
        firebase: clientConfig,
        authMethods: authMethods
      }
    });
  } catch (error) {
    console.error('Get auth config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get authentication configuration',
      message: 'Internal server error'
    });
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later'
  }
});

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Display name can only contain letters, numbers, and spaces')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/google
// @desc    Google authentication
// @access  Public
router.post('/google', authLimiter, [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required'),
  body('userData')
    .isObject()
    .withMessage('User data is required'),
  body('userData.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('userData.displayName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
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

    const { idToken, userData } = req.body;

    // Verify Google ID token
    const tokenVerification = await verifyIdToken(idToken);
    if (!tokenVerification.success) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token',
        message: 'Google authentication failed'
      });
    }

    // Handle Google authentication
    const result = await handleGoogleAuth(idToken, {
      email: userData.email,
      displayName: userData.displayName,
      googleId: tokenVerification.uid,
      profilePicture: userData.profilePicture
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: 'Google authentication failed'
      });
    }

    // Generate JWT tokens
    const token = generateToken(result.user.uid);
    const refreshToken = generateRefreshToken(result.user.uid);

    // Save refresh token
    await createDocument('refreshTokens', {
      userId: result.user.uid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/phone
// @desc    Phone number authentication
// @access  Public
router.post('/phone', authLimiter, [
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token is required'),
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
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

    const { idToken, phoneNumber, displayName } = req.body;

    // Verify Firebase ID token
    const tokenVerification = await verifyIdToken(idToken);
    if (!tokenVerification.success) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Firebase token',
        message: 'Phone authentication failed'
      });
    }

    // Handle phone authentication
    const result = await handlePhoneAuth(phoneNumber, displayName);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: 'Phone authentication failed'
      });
    }

    // Generate JWT tokens
    const token = generateToken(result.user.uid);
    const refreshToken = generateRefreshToken(result.user.uid);

    // Save refresh token
    await createDocument('refreshTokens', {
      userId: result.user.uid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Phone auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Phone authentication failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user (Email/Password)
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await createUser({
      email,
      password: hashedPassword,
      displayName
    });

    // Generate tokens
    const token = generateToken(user.uid);
    const refreshToken = generateRefreshToken(user.uid);

    // Store refresh token in database
    await createDocument('refreshTokens', {
      userId: user.uid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Remove sensitive data
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'Internal server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await updateDocument('users', user.uid, {
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1
    });

    // Generate tokens
    const token = generateToken(user.uid);
    const refreshToken = generateRefreshToken(user.uid);

    // Store refresh token
    await createDocument('refreshTokens', {
      userId: user.uid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Create web session for extension validation
    const sessionId = require('crypto').randomUUID();
    await createDocument('webSessions', {
      id: sessionId,
      userId: user.uid,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceFingerprint: req.headers['x-device-fingerprint'] || null
    });

    // Remove sensitive data
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken,
        sessionId,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'Internal server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const { queryDocuments } = require('../config/firebase');
    const tokenDocs = await queryDocuments('refreshTokens', [
      { field: 'token', operator: '==', value: refreshToken },
      { field: 'userId', operator: '==', value: decoded.userId }
    ]);

    if (tokenDocs.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Refresh token not found or expired'
      });
    }

    const tokenDoc = tokenDocs[0];
    if (new Date() > tokenDoc.expiresAt.toDate()) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired',
        message: 'Please login again'
      });
    }

    // Get user
    const user = await getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        message: 'Please login again'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.uid);
    const newRefreshToken = generateRefreshToken(user.uid);

    // Update refresh token in database
    await updateDocument('refreshTokens', tokenDoc.id, {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      message: 'Invalid or expired refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      const { queryDocuments, deleteDocument } = require('../config/firebase');
      const tokenDocs = await queryDocuments('refreshTokens', [
        { field: 'token', operator: '==', value: refreshToken },
        { field: 'userId', operator: '==', value: req.userId }
      ]);

      for (const tokenDoc of tokenDocs) {
        await deleteDocument('refreshTokens', tokenDoc.id);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: 'Internal server error during logout'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await updateDocument('users', user.uid, {
      resetToken,
      resetTokenExpiry
    });

    // TODO: Send email with reset link
    // For now, just return success
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, return the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
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

    const { token, password } = req.body;

    // Find user with reset token
    const { queryDocuments } = require('../config/firebase');
    const users = await queryDocuments('users', [
      { field: 'resetToken', operator: '==', value: token }
    ]);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token',
        message: 'Reset token is invalid or has expired'
      });
    }

    const user = users[0];

    // Check if token is expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry.toDate()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token expired',
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await updateDocument('users', user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { password, ...userResponse } = req.user;
    
    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google authentication
// @access  Public
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { idToken, deviceFingerprint, user } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token required'
      });
    }

    // Verify Google ID token with Firebase
    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    // Check if user exists
    let existingUser = await getUserById(decodedToken.uid);

    if (!existingUser) {
      // Create new user
      existingUser = await createUser({
        uid: decodedToken.uid,
        email: user.email || decodedToken.email,
        displayName: user.displayName || decodedToken.name || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || decodedToken.picture,
        provider: 'google',
        emailVerified: decodedToken.email_verified || false
      });
    } else {
      // Update last login
      await updateDocument('users', existingUser.uid, {
        lastLogin: new Date(),
        photoURL: user.photoURL || existingUser.photoURL
      });
    }

    // Generate tokens
    const token = generateToken(existingUser.uid);
    const refreshToken = generateRefreshToken(existingUser.uid);

    // Store refresh token
    await createDocument('refreshTokens', {
      userId: existingUser.uid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Create web session for extension validation
    const sessionId = require('crypto').randomUUID();
    await createDocument('webSessions', {
      id: sessionId,
      userId: existingUser.uid,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceFingerprint: deviceFingerprint || null,
      provider: 'google'
    });

    // Remove sensitive data
    const { password: _, ...userResponse } = existingUser;

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: userResponse,
        token,
        refreshToken,
        sessionId,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed',
      message: 'Internal server error during Google authentication'
    });
  }
});

// @route   POST /api/auth/session/update
// @desc    Update web session activity
// @access  Private
router.post('/session/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    // Update session activity
    await updateDocument('webSessions', sessionId, {
      lastActivity: new Date(),
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// @route   POST /api/auth/session/validate
// @desc    Validate session for extension
// @access  Private
router.post('/session/validate', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { deviceFingerprint, extensionId } = req.body;

    // Check for active web session
    const { checkActiveWebSession } = require('../middleware/auth');
    const webSession = await checkActiveWebSession(userId);

    if (!webSession.active) {
      return res.status(401).json({
        success: false,
        error: 'No active web session',
        message: 'Please log in to the web app first',
        webLoginUrl: process.env.WEB_APP_URL + '/login'
      });
    }

    // Validate device if fingerprint provided
    if (deviceFingerprint) {
      const { validateDeviceFingerprint } = require('../middleware/auth');
      const deviceValidation = await validateDeviceFingerprint(userId, deviceFingerprint);

      if (!deviceValidation.valid) {
        return res.status(403).json({
          success: false,
          error: 'Device not authorized',
          message: deviceValidation.reason
        });
      }
    }

    // Generate extension-specific token
    const extensionToken = generateToken(userId, '1h'); // Shorter expiry for extension

    res.json({
      success: true,
      message: 'Session validated successfully',
      data: {
        extensionToken,
        sessionId: webSession.sessionId,
        expiresIn: '1h'
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Session validation failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate sessions
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;

    // Invalidate web session
    if (sessionId) {
      await updateDocument('webSessions', sessionId, {
        isActive: false,
        loggedOutAt: new Date()
      });
    }

    // Invalidate all refresh tokens for this user
    const refreshTokens = await queryDocuments('refreshTokens', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    for (const tokenDoc of refreshTokens) {
      await updateDocument('refreshTokens', tokenDoc.id, {
        isValid: false,
        revokedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

module.exports = router;
