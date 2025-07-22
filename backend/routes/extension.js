const express = require('express');
const { body, validationResult } = require('express-validator');
const { extensionAuth, optionalAuth } = require('../middleware/auth');
const { extensionSecurityMiddleware } = require('../middleware/security');
const {
  createDocument,
  updateDocument,
  queryDocuments,
  incrementUserRequestCount
} = require('../config/firebase');
const { generateResponse, moderateContent } = require('../config/gemini');

const router = express.Router();

// @route   GET /api/extension/manifest
// @desc    Get Chrome extension manifest
// @access  Public
router.get('/manifest', async (req, res) => {
  try {
    const manifest = {
      manifest_version: 3,
      name: "Rehbar AI - Voice Assistant",
      version: "1.0.0",
      description: "AI-powered voice assistant for seamless web browsing and productivity",
      
      permissions: [
        "activeTab",
        "storage",
        "scripting",
        "contextMenus",
        "notifications"
      ],
      
      host_permissions: [
        "https://*/*",
        "http://*/*"
      ],
      
      background: {
        service_worker: "background.js"
      },
      
      content_scripts: [
        {
          matches: ["<all_urls>"],
          js: ["content.js"],
          css: ["content.css"]
        }
      ],
      
      action: {
        default_popup: "popup.html",
        default_title: "Rehbar AI Assistant",
        default_icon: {
          "16": "icons/icon16.png",
          "32": "icons/icon32.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      },
      
      icons: {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      },
      
      web_accessible_resources: [
        {
          resources: ["icons/*", "sounds/*"],
          matches: ["<all_urls>"]
        }
      ]
    };

    res.json({
      success: true,
      data: manifest
    });

  } catch (error) {
    console.error('Get manifest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get manifest',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/extension/quick-chat
// @desc    Quick chat for extension popup
// @access  Private (Extension only)
router.post('/quick-chat', extensionSecurityMiddleware, extensionAuth, [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
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

    const { message, context = {} } = req.body;
    const userId = req.userId;

    // Check user limits
    const { checkUserLimits } = require('../config/firebase');
    const limitCheck = await checkUserLimits(userId);

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Request limit exceeded',
        message: limitCheck.reason,
        remaining: 0
      });
    }

    // Moderate content
    const moderation = await moderateContent(message);
    if (!moderation.appropriate) {
      return res.status(400).json({
        success: false,
        error: 'Content not allowed',
        message: 'Your message contains inappropriate content'
      });
    }

    // Add context to the message if available
    let contextualMessage = message;
    if (context.pageTitle || context.selectedText || context.url) {
      contextualMessage = `Context: ${JSON.stringify(context)}\n\nUser message: ${message}`;
    }

    // Generate AI response
    const aiResponse = await generateResponse(contextualMessage, 'helpful');

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'AI response failed',
        message: aiResponse.error || 'Failed to generate response'
      });
    }

    // Save interaction
    await createDocument('extensionInteractions', {
      userId,
      message,
      response: aiResponse.response,
      context,
      tokensUsed: aiResponse.tokensUsed || 0,
      source: 'extension_popup'
    });

    // Increment user request count
    await incrementUserRequestCount(userId);

    res.json({
      success: true,
      data: {
        response: aiResponse.response,
        tokensUsed: aiResponse.tokensUsed || 0,
        remaining: limitCheck.remaining - 1
      }
    });

  } catch (error) {
    console.error('Extension quick chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Quick chat failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/extension/context-action
// @desc    Handle context menu actions
// @access  Private (Extension only)
router.post('/context-action', extensionAuth, [
  body('action')
    .isIn(['explain', 'summarize', 'translate', 'rewrite', 'analyze'])
    .withMessage('Invalid action type'),
  body('selectedText')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Selected text must be between 1 and 5000 characters'),
  body('pageContext')
    .optional()
    .isObject()
    .withMessage('Page context must be an object')
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

    const { action, selectedText, pageContext = {} } = req.body;
    const userId = req.userId;

    // Check user limits
    const { checkUserLimits } = require('../config/firebase');
    const limitCheck = await checkUserLimits(userId);

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Request limit exceeded',
        message: limitCheck.reason
      });
    }

    // Create action-specific prompts
    const actionPrompts = {
      explain: `Please explain the following text in simple terms:\n\n"${selectedText}"`,
      summarize: `Please provide a concise summary of the following text:\n\n"${selectedText}"`,
      translate: `Please translate the following text to English (if it's not already in English, otherwise translate to Spanish):\n\n"${selectedText}"`,
      rewrite: `Please rewrite the following text to make it clearer and more professional:\n\n"${selectedText}"`,
      analyze: `Please analyze the following text and provide insights:\n\n"${selectedText}"`
    };

    const prompt = actionPrompts[action];

    // Generate AI response
    const aiResponse = await generateResponse(prompt, 'professional');

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'AI response failed',
        message: aiResponse.error || 'Failed to generate response'
      });
    }

    // Save interaction
    await createDocument('extensionInteractions', {
      userId,
      action,
      selectedText,
      response: aiResponse.response,
      pageContext,
      tokensUsed: aiResponse.tokensUsed || 0,
      source: 'extension_context_menu'
    });

    // Increment user request count
    await incrementUserRequestCount(userId);

    res.json({
      success: true,
      data: {
        action,
        response: aiResponse.response,
        tokensUsed: aiResponse.tokensUsed || 0,
        remaining: limitCheck.remaining - 1
      }
    });

  } catch (error) {
    console.error('Extension context action error:', error);
    res.status(500).json({
      success: false,
      error: 'Context action failed',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/extension/user-status
// @desc    Get user status for extension
// @access  Private (Extension only)
router.get('/user-status', extensionAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = req.userId;

    // Check user limits
    const { checkUserLimits } = require('../config/firebase');
    const limitCheck = await checkUserLimits(userId);

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (user.subscriptionTier === 'trial' && user.trialEndDate) {
      const trialEnd = user.trialEndDate.toDate();
      const now = new Date();
      const diffTime = trialEnd - now;
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl
        },
        subscription: {
          tier: user.subscriptionTier || 'trial',
          status: user.subscriptionStatus || 'active',
          trialDaysRemaining
        },
        usage: {
          dailyRequests: user.dailyRequestCount || 0,
          remaining: limitCheck.remaining,
          allowed: limitCheck.allowed
        },
        preferences: user.preferences || {}
      }
    });

  } catch (error) {
    console.error('Get extension user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user status',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/extension/save-settings
// @desc    Save extension settings
// @access  Private (Extension only)
router.post('/save-settings', extensionAuth, [
  body('settings')
    .isObject()
    .withMessage('Settings must be an object')
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

    const { settings } = req.body;
    const userId = req.userId;

    // Validate settings structure
    const allowedSettings = [
      'autoActivate',
      'shortcutKey',
      'voiceEnabled',
      'notificationsEnabled',
      'theme',
      'position'
    ];

    const validSettings = {};
    Object.keys(settings).forEach(key => {
      if (allowedSettings.includes(key)) {
        validSettings[key] = settings[key];
      }
    });

    // Update user's extension settings
    const currentPreferences = req.user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      extensionSettings: {
        ...currentPreferences.extensionSettings,
        ...validSettings
      }
    };

    await updateDocument('users', userId, {
      preferences: updatedPreferences
    });

    res.json({
      success: true,
      message: 'Extension settings saved successfully',
      data: {
        settings: validSettings
      }
    });

  } catch (error) {
    console.error('Save extension settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save settings',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/extension/history
// @desc    Get extension interaction history
// @access  Private (Extension only)
router.get('/history', extensionAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;

    // Get recent extension interactions
    const interactions = await queryDocuments('extensionInteractions', [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'createdAt', direction: 'desc' }, limit);

    const formattedInteractions = interactions.map(interaction => ({
      id: interaction.id,
      message: interaction.message,
      response: interaction.response,
      action: interaction.action,
      source: interaction.source,
      timestamp: interaction.createdAt,
      tokensUsed: interaction.tokensUsed || 0
    }));

    res.json({
      success: true,
      data: {
        interactions: formattedInteractions,
        total: formattedInteractions.length
      }
    });

  } catch (error) {
    console.error('Get extension history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/extension/meeting-suggestions
// @desc    Get AI suggestions for meeting context
// @access  Private (Extension only)
router.post('/meeting-suggestions', extensionAuth, [
  body('transcript')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Transcript must be between 10 and 5000 characters'),
  body('platform')
    .optional()
    .isString()
    .withMessage('Platform must be a string'),
  body('meetingType')
    .optional()
    .isIn(['interview', 'sales', 'meeting', 'general'])
    .withMessage('Invalid meeting type')
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

    const { transcript, platform, meetingType = 'general', userRole = 'participant' } = req.body;
    const userId = req.userId;

    // Check user limits
    const { checkUserLimits } = require('../config/firebase');
    const limitCheck = await checkUserLimits(userId);

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Request limit exceeded',
        message: limitCheck.reason
      });
    }

    // Generate meeting-specific suggestions
    const suggestions = await generateMeetingSuggestions(transcript, meetingType, userRole, platform);

    // Save interaction
    await createDocument('meetingInteractions', {
      userId,
      transcript,
      suggestions,
      platform,
      meetingType,
      userRole,
      source: 'meeting_copilot'
    });

    // Increment user request count
    await incrementUserRequestCount(userId);

    res.json({
      success: true,
      data: {
        suggestions,
        meetingType,
        platform,
        remaining: limitCheck.remaining - 1
      }
    });

  } catch (error) {
    console.error('Meeting suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/extension/user-context
// @desc    Get user context for meetings
// @access  Private (Extension only)
router.get('/user-context', extensionAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = req.userId;

    // Get user's resume/profile data
    const userProfile = await getDocument('userProfiles', userId);

    // Get recent meeting history
    const recentMeetings = await queryDocuments('meetingInteractions', [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'createdAt', direction: 'desc' }, 5);

    const context = {
      user: {
        name: user.displayName,
        email: user.email,
        role: userProfile?.role || 'professional'
      },
      profile: userProfile || {},
      recentMeetings: recentMeetings.map(meeting => ({
        type: meeting.meetingType,
        platform: meeting.platform,
        date: meeting.createdAt
      })),
      preferences: user.preferences || {}
    };

    res.json({
      success: true,
      data: context
    });

  } catch (error) {
    console.error('Get user context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user context',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/extension/feedback
// @desc    Submit extension feedback
// @access  Private (Extension only)
router.post('/feedback', extensionAuth, [
  body('type')
    .isIn(['bug', 'feature', 'improvement', 'other'])
    .withMessage('Invalid feedback type'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Feedback message must be between 10 and 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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

    const { type, message, rating } = req.body;
    const userId = req.userId;

    // Save feedback
    await createDocument('extensionFeedback', {
      userId,
      type,
      message,
      rating: rating || null,
      source: 'chrome_extension',
      status: 'new'
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping us improve!'
    });

  } catch (error) {
    console.error('Submit extension feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      message: 'Internal server error'
    });
  }
});

// Helper function to generate meeting suggestions
async function generateMeetingSuggestions(transcript, meetingType, userRole, platform) {
  const { generateResponse } = require('../config/gemini');

  // Create context-aware prompts based on meeting type
  const prompts = {
    interview: {
      response: `Based on this interview transcript: "${transcript}", suggest 3 professional responses that showcase experience and skills. Focus on STAR method (Situation, Task, Action, Result).`,
      question: `Based on this interview transcript: "${transcript}", suggest 2 thoughtful questions to ask the interviewer that show genuine interest and research.`,
      objection: `Based on this interview transcript: "${transcript}", suggest ways to address any concerns or turn potential weaknesses into strengths.`
    },
    sales: {
      response: `Based on this sales call transcript: "${transcript}", suggest 3 persuasive responses that address customer needs and overcome objections.`,
      question: `Based on this sales call transcript: "${transcript}", suggest 2 discovery questions to better understand customer pain points.`,
      objection: `Based on this sales call transcript: "${transcript}", suggest ways to handle objections and move the conversation forward.`
    },
    meeting: {
      response: `Based on this meeting transcript: "${transcript}", suggest 3 professional responses that add value to the discussion.`,
      question: `Based on this meeting transcript: "${transcript}", suggest 2 clarifying questions to ensure understanding.`,
      objection: `Based on this meeting transcript: "${transcript}", suggest diplomatic ways to present alternative viewpoints.`
    }
  };

  const selectedPrompts = prompts[meetingType] || prompts.meeting;
  const suggestions = [];

  try {
    // Generate different types of suggestions
    for (const [type, prompt] of Object.entries(selectedPrompts)) {
      const response = await generateResponse(prompt, 'professional');

      if (response.success) {
        // Parse response into individual suggestions
        const suggestionTexts = response.response
          .split(/\d+\.|\n-|\n•/)
          .filter(text => text.trim().length > 20)
          .slice(0, 3);

        suggestionTexts.forEach((text, index) => {
          suggestions.push({
            type: type,
            text: text.trim(),
            confidence: 0.8 + (Math.random() * 0.2), // Simulate confidence score
            priority: index + 1,
            platform: platform
          });
        });
      }
    }

    // Sort by confidence and limit to top 6
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

  } catch (error) {
    console.error('Error generating meeting suggestions:', error);
    return [];
  }
}

module.exports = router;
