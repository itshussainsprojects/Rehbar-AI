const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { 
  getDocument, 
  updateDocument, 
  queryDocuments,
  deleteDocument 
} = require('../config/firebase');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    
    // Get user statistics
    const conversations = await queryDocuments('conversations', [
      { field: 'userId', operator: '==', value: req.userId },
      { field: 'isActive', operator: '==', value: true }
    ]);

    const totalMessages = await queryDocuments('messages', [
      { field: 'userId', operator: '==', value: req.userId }
    ]);

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (user.subscriptionTier === 'trial' && user.trialEndDate) {
      const trialEnd = user.trialEndDate.toDate();
      const now = new Date();
      const diffTime = trialEnd - now;
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const { password, resetToken, resetTokenExpiry, ...userProfile } = user;

    res.json({
      success: true,
      data: {
        user: userProfile,
        statistics: {
          totalConversations: conversations.length,
          totalMessages: totalMessages.length,
          trialDaysRemaining,
          dailyRequestsUsed: user.dailyRequestCount || 0,
          subscriptionStatus: user.subscriptionTier || 'trial'
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Display name can only contain letters, numbers, and spaces'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
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

    const userId = req.userId;
    const { displayName, email } = req.body;
    const updates = {};

    if (displayName) {
      updates.displayName = displayName;
    }

    if (email && email !== req.user.email) {
      // Check if email is already in use
      const { getUserByEmail } = require('../config/firebase');
      const existingUser = await getUserByEmail(email);
      if (existingUser && existingUser.uid !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use',
          message: 'This email address is already associated with another account'
        });
      }
      updates.email = email;
      updates.emailVerified = false; // Require re-verification
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided',
        message: 'Please provide at least one field to update'
      });
    }

    const updatedUser = await updateDocument('users', userId, updates);

    // Remove sensitive data
    const { password, resetToken, resetTokenExpiry, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid current password',
        message: 'The current password you entered is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password || '');
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'Same password',
        message: 'New password must be different from current password'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await updateDocument('users', userId, {
      password: hashedNewPassword,
      passwordChangedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences || {
          voiceSpeed: 1.0,
          voicePitch: 1.0,
          preferredVoice: 'default',
          language: 'en',
          theme: 'dark',
          notificationsEnabled: true
        }
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('voiceSpeed')
    .optional()
    .isFloat({ min: 0.5, max: 2.0 })
    .withMessage('Voice speed must be between 0.5 and 2.0'),
  body('voicePitch')
    .optional()
    .isFloat({ min: 0.5, max: 2.0 })
    .withMessage('Voice pitch must be between 0.5 and 2.0'),
  body('preferredVoice')
    .optional()
    .isIn(['default', 'male', 'female', 'robotic'])
    .withMessage('Invalid voice preference'),
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
    .withMessage('Invalid language'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme'),
  body('notificationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean')
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

    const userId = req.userId;
    const currentPreferences = req.user.preferences || {};
    const newPreferences = { ...currentPreferences, ...req.body };

    await updateDocument('users', userId, {
      preferences: newPreferences
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: newPreferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    const userId = req.userId;
    
    // TODO: Upload to cloud storage (Firebase Storage, AWS S3, etc.)
    // For now, we'll just simulate the upload
    const avatarUrl = `https://api.rehbar-ai.com/uploads/avatars/${userId}_${Date.now()}.jpg`;

    await updateDocument('users', userId, {
      avatarUrl
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  body('confirmation')
    .equals('DELETE')
    .withMessage('Please type DELETE to confirm account deletion')
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

    const { password } = req.body;
    const userId = req.userId;
    const user = req.user;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Soft delete user account
    await updateDocument('users', userId, {
      isActive: false,
      deletedAt: new Date(),
      email: `deleted_${userId}@deleted.com` // Anonymize email
    });

    // Delete all refresh tokens
    const refreshTokens = await queryDocuments('refreshTokens', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    for (const token of refreshTokens) {
      await deleteDocument('refreshTokens', token.id);
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', async (req, res) => {
  try {
    const userId = req.userId;
    const user = req.user;

    // Get usage data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMessages = await queryDocuments('messages', [
      { field: 'userId', operator: '==', value: userId },
      { field: 'createdAt', operator: '>=', value: thirtyDaysAgo }
    ]);

    // Group messages by date
    const dailyUsage = {};
    recentMessages.forEach(message => {
      const date = message.createdAt.toDate().toDateString();
      if (!dailyUsage[date]) {
        dailyUsage[date] = { messages: 0, tokens: 0 };
      }
      dailyUsage[date].messages++;
      dailyUsage[date].tokens += message.tokensUsed || 0;
    });

    // Get subscription limits
    const limits = {
      trial: parseInt(process.env.FREE_DAILY_REQUESTS) || 50,
      pro: parseInt(process.env.PRO_DAILY_REQUESTS) || 1000,
      premium: parseInt(process.env.PREMIUM_DAILY_REQUESTS) || 5000
    };

    const userLimit = limits[user.subscriptionTier] || limits.trial;

    res.json({
      success: true,
      data: {
        currentUsage: {
          dailyRequests: user.dailyRequestCount || 0,
          dailyLimit: userLimit,
          remaining: userLimit - (user.dailyRequestCount || 0)
        },
        subscriptionInfo: {
          tier: user.subscriptionTier || 'trial',
          status: user.subscriptionStatus || 'active',
          trialEndDate: user.trialEndDate,
          subscriptionEndDate: user.subscriptionEndDate
        },
        dailyUsage: Object.entries(dailyUsage).map(([date, usage]) => ({
          date,
          ...usage
        })).sort((a, b) => new Date(a.date) - new Date(b.date))
      }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage data',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
