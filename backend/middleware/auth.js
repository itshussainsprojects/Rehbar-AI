const jwt = require('jsonwebtoken');
const { getUserById } = require('../config/firebase');

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }

    // Check if user's subscription is still valid
    if (user.subscriptionTier === 'trial') {
      const trialEndDate = user.trialEndDate?.toDate();
      if (trialEndDate && new Date() > trialEndDate) {
        return res.status(403).json({
          error: 'Trial expired',
          message: 'Your trial period has expired. Please upgrade to continue using the service.'
        });
      }
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.id || user.uid;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id || user.uid;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run regular auth
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authorization error',
      message: 'Internal server error during authorization'
    });
  }
};

// Subscription tier middleware
const requireSubscription = (requiredTier) => {
  const tierLevels = {
    trial: 0,
    pro: 1,
    premium: 2
  };

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this feature'
        });
      }

      const userTierLevel = tierLevels[req.user.subscriptionTier] || 0;
      const requiredTierLevel = tierLevels[requiredTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({
          error: 'Subscription upgrade required',
          message: `This feature requires ${requiredTier} subscription or higher`,
          currentTier: req.user.subscriptionTier,
          requiredTier: requiredTier
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Subscription check error',
        message: 'Internal server error during subscription verification'
      });
    }
  };
};

// Rate limiting middleware for API requests
const checkApiLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to make API requests'
      });
    }

    const { checkUserLimits } = require('../config/firebase');
    const limitCheck = await checkUserLimits(req.userId);

    if (!limitCheck.allowed) {
      const statusCode = limitCheck.reason === 'Trial period expired' ? 403 : 429;
      return res.status(statusCode).json({
        error: 'Request limit exceeded',
        message: limitCheck.reason,
        remaining: 0
      });
    }

    // Add remaining requests to response headers
    res.set('X-RateLimit-Remaining', limitCheck.remaining.toString());
    
    // Attach limit info to request for later use
    req.apiLimits = limitCheck;
    
    next();
  } catch (error) {
    console.error('API limits check error:', error);
    return res.status(500).json({
      error: 'Limit check error',
      message: 'Internal server error during limit verification'
    });
  }
};

// Enhanced Chrome extension authentication middleware
const extensionAuth = async (req, res, next) => {
  try {
    // Check if request is from Chrome extension
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'];
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    const extensionId = req.headers['x-extension-id'];

    if (!origin || !origin.startsWith('chrome-extension://')) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This endpoint is only accessible from Chrome extension',
        code: 'INVALID_ORIGIN'
      });
    }

    // Validate extension ID
    const validExtensionIds = process.env.VALID_EXTENSION_IDS?.split(',') || [];
    if (validExtensionIds.length > 0 && !validExtensionIds.includes(extensionId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid extension ID',
        code: 'INVALID_EXTENSION'
      });
    }

    // Run regular authentication
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Additional extension-specific validations
    const userId = req.userId;

    // Check if user has active web session
    const webSession = await checkActiveWebSession(userId);
    if (!webSession.active) {
      return res.status(401).json({
        error: 'Web authentication required',
        message: 'Please log in to the web app first before using the extension',
        code: 'WEB_AUTH_REQUIRED',
        webLoginUrl: process.env.WEB_APP_URL + '/login'
      });
    }

    // Validate device fingerprint if provided
    if (deviceFingerprint) {
      const deviceValidation = await validateDeviceFingerprint(userId, deviceFingerprint);
      if (!deviceValidation.valid) {
        return res.status(403).json({
          error: 'Device validation failed',
          message: 'This device is not authorized for extension access',
          code: 'DEVICE_NOT_AUTHORIZED'
        });
      }
    }

    // Check for suspicious activity
    const securityCheck = await performSecurityCheck(userId, req);
    if (!securityCheck.passed) {
      return res.status(429).json({
        error: 'Security check failed',
        message: securityCheck.reason,
        code: 'SECURITY_VIOLATION'
      });
    }

    // Attach additional context
    req.extensionContext = {
      deviceFingerprint,
      extensionId,
      webSessionId: webSession.sessionId,
      securityLevel: securityCheck.level
    };

    next();
  } catch (error) {
    console.error('Extension authentication error:', error);
    return res.status(500).json({
      error: 'Extension authentication error',
      message: 'Internal server error during extension authentication',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Generate JWT token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRE || '24h') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Helper function to check active web session
const checkActiveWebSession = async (userId) => {
  try {
    const { queryDocuments } = require('../config/firebase');

    // Check for active web sessions in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeSessions = await queryDocuments('webSessions', [
      { field: 'userId', operator: '==', value: userId },
      { field: 'isActive', operator: '==', value: true },
      { field: 'lastActivity', operator: '>', value: twentyFourHoursAgo }
    ]);

    if (activeSessions.length > 0) {
      const latestSession = activeSessions.sort((a, b) =>
        b.lastActivity.toDate() - a.lastActivity.toDate()
      )[0];

      return {
        active: true,
        sessionId: latestSession.id,
        lastActivity: latestSession.lastActivity.toDate()
      };
    }

    return { active: false };
  } catch (error) {
    console.error('Error checking web session:', error);
    return { active: false };
  }
};

// Helper function to validate device fingerprint
const validateDeviceFingerprint = async (userId, fingerprint) => {
  try {
    const { queryDocuments, createDocument, updateDocument } = require('../config/firebase');

    // Check if device is already registered
    const existingDevices = await queryDocuments('userDevices', [
      { field: 'userId', operator: '==', value: userId },
      { field: 'fingerprint', operator: '==', value: fingerprint }
    ]);

    if (existingDevices.length > 0) {
      const device = existingDevices[0];

      // Check if device is blocked
      if (device.status === 'blocked') {
        return { valid: false, reason: 'Device is blocked' };
      }

      // Update last seen
      await updateDocument('userDevices', device.id, {
        lastSeen: new Date(),
        lastActivity: new Date()
      });

      return { valid: true, deviceId: device.id };
    }

    // Auto-register new device for existing users
    const newDevice = await createDocument('userDevices', {
      userId,
      fingerprint,
      status: 'active',
      firstSeen: new Date(),
      lastSeen: new Date(),
      lastActivity: new Date(),
      deviceType: 'extension',
      autoRegistered: true
    });

    return { valid: true, deviceId: newDevice.id, isNew: true };
  } catch (error) {
    console.error('Error validating device fingerprint:', error);
    return { valid: false, reason: 'Device validation error' };
  }
};

// Helper function to perform security checks
const performSecurityCheck = async (userId, req) => {
  try {
    const { queryDocuments, createDocument } = require('../config/firebase');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check for rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = await queryDocuments('extensionRequests', [
      { field: 'userId', operator: '==', value: userId },
      { field: 'timestamp', operator: '>', value: oneHourAgo }
    ]);

    // Rate limit: 100 requests per hour
    if (recentRequests.length > 100) {
      return {
        passed: false,
        reason: 'Rate limit exceeded',
        level: 'high_risk'
      };
    }

    // Check for suspicious IP patterns
    const ipRequests = recentRequests.filter(req => req.ip === ip);
    if (ipRequests.length > 50) {
      return {
        passed: false,
        reason: 'Suspicious IP activity',
        level: 'high_risk'
      };
    }

    // Log the request for monitoring
    await createDocument('extensionRequests', {
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
      endpoint: req.path
    });

    return {
      passed: true,
      level: 'normal'
    };
  } catch (error) {
    console.error('Error performing security check:', error);
    return {
      passed: true, // Fail open for availability
      level: 'unknown'
    };
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuth,
  requireSubscription,
  checkApiLimits,
  extensionAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  checkActiveWebSession,
  validateDeviceFingerprint,
  performSecurityCheck
};
