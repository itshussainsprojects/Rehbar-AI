// Enhanced Security Middleware for Rehbar AI
// Comprehensive protection against fraud, abuse, and unauthorized access

const rateLimit = require('express-rate-limit');
const { createDocument, queryDocuments, updateDocument } = require('../config/firebase');

// Advanced rate limiting with user-specific limits
const createAdvancedRateLimit = (options = {}) => {
  const {
    windowMs = 60 * 60 * 1000, // 1 hour
    maxRequests = 100,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = null
  } = options;

  return rateLimit({
    windowMs,
    max: async (req) => {
      // Different limits for different user tiers
      if (req.user) {
        const tier = req.user.subscriptionTier;
        switch (tier) {
          case 'premium': return maxRequests * 5;
          case 'pro': return maxRequests * 2;
          case 'trial': return maxRequests;
          default: return Math.floor(maxRequests / 2);
        }
      }
      return Math.floor(maxRequests / 4); // Unauthenticated users
    },
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
      // Log rate limit violations
      await logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.path,
        userId: req.user?.id || null
      });

      if (onLimitReached) {
        onLimitReached(req, res);
      }

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Device fingerprint validation middleware
const validateDeviceFingerprint = async (req, res, next) => {
  try {
    const fingerprint = req.headers['x-device-fingerprint'];
    const userId = req.user?.id || req.userId;

    if (!fingerprint && process.env.DEVICE_FINGERPRINT_REQUIRED === 'true') {
      return res.status(400).json({
        error: 'Device fingerprint required',
        message: 'Device fingerprint is required for security validation'
      });
    }

    if (fingerprint && userId) {
      // Check device registration
      const devices = await queryDocuments('userDevices', [
        { field: 'userId', operator: '==', value: userId },
        { field: 'fingerprint', operator: '==', value: fingerprint }
      ]);

      if (devices.length === 0) {
        // Check if user has reached device limit
        const userDevices = await queryDocuments('userDevices', [
          { field: 'userId', operator: '==', value: userId },
          { field: 'status', operator: '==', value: 'active' }
        ]);

        const maxDevices = parseInt(process.env.MAX_DEVICES_PER_USER) || 5;
        
        if (userDevices.length >= maxDevices) {
          await logSecurityEvent(req, 'DEVICE_LIMIT_EXCEEDED', {
            userId,
            fingerprint,
            currentDevices: userDevices.length,
            maxDevices
          });

          return res.status(403).json({
            error: 'Device limit exceeded',
            message: `Maximum ${maxDevices} devices allowed per user`
          });
        }

        // Auto-register new device if enabled
        if (process.env.AUTO_REGISTER_DEVICES === 'true') {
          await createDocument('userDevices', {
            userId,
            fingerprint,
            status: 'active',
            firstSeen: new Date(),
            lastSeen: new Date(),
            deviceType: 'extension',
            autoRegistered: true,
            userAgent: req.headers['user-agent'],
            ip: req.ip
          });

          await logSecurityEvent(req, 'DEVICE_AUTO_REGISTERED', {
            userId,
            fingerprint
          });
        }
      } else {
        // Update device activity
        const device = devices[0];
        await updateDocument('userDevices', device.id, {
          lastSeen: new Date(),
          lastActivity: new Date(),
          ip: req.ip
        });
      }
    }

    next();
  } catch (error) {
    console.error('Device fingerprint validation error:', error);
    next(); // Continue without blocking
  }
};

// Suspicious activity detection
const detectSuspiciousActivity = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const endpoint = req.path;

    // Check for suspicious patterns
    const suspiciousPatterns = await checkSuspiciousPatterns(userId, ip, userAgent, endpoint);

    if (suspiciousPatterns.length > 0) {
      await logSecurityEvent(req, 'SUSPICIOUS_ACTIVITY_DETECTED', {
        userId,
        ip,
        userAgent,
        endpoint,
        patterns: suspiciousPatterns
      });

      // Block if high risk
      const highRiskPatterns = suspiciousPatterns.filter(p => p.riskLevel === 'high');
      if (highRiskPatterns.length > 0) {
        return res.status(403).json({
          error: 'Suspicious activity detected',
          message: 'Your request has been blocked due to suspicious activity',
          code: 'SUSPICIOUS_ACTIVITY'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    next(); // Continue without blocking
  }
};

// Check for suspicious patterns
async function checkSuspiciousPatterns(userId, ip, userAgent, endpoint) {
  const patterns = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    // Check for rapid requests from same IP
    const ipRequests = await queryDocuments('extensionRequests', [
      { field: 'ip', operator: '==', value: ip },
      { field: 'timestamp', operator: '>', value: oneHourAgo }
    ]);

    if (ipRequests.length > 200) {
      patterns.push({
        type: 'HIGH_FREQUENCY_IP',
        riskLevel: 'high',
        details: `${ipRequests.length} requests from IP in last hour`
      });
    }

    // Check for user agent anomalies
    if (!userAgent || userAgent.length < 10) {
      patterns.push({
        type: 'SUSPICIOUS_USER_AGENT',
        riskLevel: 'medium',
        details: 'Missing or suspicious user agent'
      });
    }

    // Check for unusual endpoint access patterns
    const endpointRequests = await queryDocuments('extensionRequests', [
      { field: 'userId', operator: '==', value: userId },
      { field: 'endpoint', operator: '==', value: endpoint },
      { field: 'timestamp', operator: '>', value: oneHourAgo }
    ]);

    if (endpointRequests.length > 50) {
      patterns.push({
        type: 'ENDPOINT_ABUSE',
        riskLevel: 'medium',
        details: `${endpointRequests.length} requests to ${endpoint} in last hour`
      });
    }

    // Check for multiple user IDs from same IP
    const ipUserIds = new Set(ipRequests.map(req => req.userId).filter(Boolean));
    if (ipUserIds.size > 10) {
      patterns.push({
        type: 'MULTIPLE_USERS_SAME_IP',
        riskLevel: 'high',
        details: `${ipUserIds.size} different users from same IP`
      });
    }

  } catch (error) {
    console.error('Error checking suspicious patterns:', error);
  }

  return patterns;
}

// Log security events
async function logSecurityEvent(req, eventType, details) {
  try {
    await createDocument('securityEvents', {
      eventType,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || req.userId || null,
      endpoint: req.path,
      method: req.method,
      details,
      severity: getSeverityLevel(eventType)
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Get severity level for event types
function getSeverityLevel(eventType) {
  const severityMap = {
    'RATE_LIMIT_EXCEEDED': 'medium',
    'DEVICE_LIMIT_EXCEEDED': 'high',
    'DEVICE_AUTO_REGISTERED': 'low',
    'SUSPICIOUS_ACTIVITY_DETECTED': 'high',
    'UNAUTHORIZED_ACCESS_ATTEMPT': 'high',
    'TOKEN_VALIDATION_FAILED': 'medium',
    'SESSION_HIJACK_ATTEMPT': 'critical'
  };

  return severityMap[eventType] || 'medium';
}

// IP whitelist middleware
const ipWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    if (whitelist.length === 0) {
      return next(); // No whitelist configured
    }

    const clientIP = req.ip;
    
    if (!whitelist.includes(clientIP)) {
      return res.status(403).json({
        error: 'IP not whitelisted',
        message: 'Your IP address is not authorized to access this resource'
      });
    }

    next();
  };
};

// Extension-specific security middleware
const extensionSecurityMiddleware = [
  validateDeviceFingerprint,
  detectSuspiciousActivity,
  createAdvancedRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: parseInt(process.env.EXTENSION_RATE_LIMIT_PER_HOUR) || 100
  })
];

module.exports = {
  createAdvancedRateLimit,
  validateDeviceFingerprint,
  detectSuspiciousActivity,
  extensionSecurityMiddleware,
  ipWhitelist,
  logSecurityEvent
};
