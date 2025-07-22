const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  generateResponse, 
  generateStreamingResponse,
  analyzeIntent,
  getPersonalities,
  moderateContent
} = require('../config/gemini');
const { 
  createDocument, 
  updateDocument, 
  getDocument,
  queryDocuments,
  incrementUserRequestCount 
} = require('../config/firebase');
const { checkApiLimits } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message must be between 1 and 4000 characters'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Invalid conversation ID'),
  body('personality')
    .optional()
    .isIn(['helpful', 'creative', 'professional', 'casual', 'technical'])
    .withMessage('Invalid personality type')
];

// @route   POST /api/ai/chat
// @desc    Send message to AI and get response
// @access  Private
router.post('/chat', checkApiLimits, chatValidation, async (req, res) => {
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

    const { message, conversationId, personality = 'helpful' } = req.body;
    const userId = req.userId;

    // Moderate content
    const moderation = await moderateContent(message);
    if (!moderation.appropriate) {
      return res.status(400).json({
        success: false,
        error: 'Content not allowed',
        message: 'Your message contains inappropriate content',
        reason: moderation.reason
      });
    }

    // Get or create conversation
    let conversation;
    let conversationHistory = [];

    if (conversationId) {
      conversation = await getDocument('conversations', conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
          message: 'Conversation not found or access denied'
        });
      }

      // Get recent messages for context
      conversationHistory = await queryDocuments('messages', [
        { field: 'conversationId', operator: '==', value: conversationId }
      ], { field: 'createdAt', direction: 'desc' }, 20);
      
      conversationHistory = conversationHistory.reverse(); // Oldest first
    } else {
      // Create new conversation
      const { generateTitle } = require('../config/gemini');
      const title = await generateTitle(message);
      
      conversation = await createDocument('conversations', {
        userId,
        title,
        personality,
        messageCount: 0,
        isActive: true
      });
    }

    // Analyze user intent
    const intent = await analyzeIntent(message);

    // Save user message
    const userMessage = await createDocument('messages', {
      conversationId: conversation.id,
      userId,
      content: message,
      sender: 'user',
      intent: intent.intent,
      sentiment: intent.sentiment,
      entities: intent.entities || []
    });

    // Generate AI response
    const aiResponse = await generateResponse(
      message, 
      personality, 
      conversationHistory.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }))
    );

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'AI response failed',
        message: aiResponse.error || 'Failed to generate response'
      });
    }

    // Save AI message
    const aiMessage = await createDocument('messages', {
      conversationId: conversation.id,
      userId,
      content: aiResponse.response,
      sender: 'ai',
      tokensUsed: aiResponse.tokensUsed || 0,
      personality
    });

    // Update conversation
    await updateDocument('conversations', conversation.id, {
      messageCount: (conversation.messageCount || 0) + 2,
      lastMessageAt: new Date(),
      lastMessage: aiResponse.response.substring(0, 100)
    });

    // Increment user request count
    await incrementUserRequestCount(userId);

    res.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title
        },
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          content: aiMessage.content,
          timestamp: aiMessage.createdAt
        },
        intent,
        tokensUsed: aiResponse.tokensUsed || 0,
        remaining: req.apiLimits.remaining - 1
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: 'Internal server error during chat processing'
    });
  }
});

// @route   POST /api/ai/stream
// @desc    Stream AI response
// @access  Private
router.post('/stream', checkApiLimits, chatValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, conversationId, personality = 'helpful' } = req.body;
    const userId = req.userId;

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Moderate content
    const moderation = await moderateContent(message);
    if (!moderation.appropriate) {
      res.write(`data: ${JSON.stringify({
        error: 'Content not allowed',
        message: 'Your message contains inappropriate content'
      })}\n\n`);
      res.end();
      return;
    }

    // Get conversation and history
    let conversation;
    let conversationHistory = [];

    if (conversationId) {
      conversation = await getDocument('conversations', conversationId);
      if (!conversation || conversation.userId !== userId) {
        res.write(`data: ${JSON.stringify({
          error: 'Conversation not found'
        })}\n\n`);
        res.end();
        return;
      }

      conversationHistory = await queryDocuments('messages', [
        { field: 'conversationId', operator: '==', value: conversationId }
      ], { field: 'createdAt', direction: 'desc' }, 20);
      
      conversationHistory = conversationHistory.reverse();
    } else {
      const { generateTitle } = require('../config/gemini');
      const title = await generateTitle(message);
      
      conversation = await createDocument('conversations', {
        userId,
        title,
        personality,
        messageCount: 0,
        isActive: true
      });
    }

    // Save user message
    const userMessage = await createDocument('messages', {
      conversationId: conversation.id,
      userId,
      content: message,
      sender: 'user'
    });

    // Send conversation info
    res.write(`data: ${JSON.stringify({
      type: 'conversation',
      data: {
        id: conversation.id,
        title: conversation.title
      }
    })}\n\n`);

    // Generate streaming response
    const stream = await generateStreamingResponse(
      message,
      personality,
      conversationHistory.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }))
    );

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        data: chunkText
      })}\n\n`);
    }

    // Save AI message
    const aiMessage = await createDocument('messages', {
      conversationId: conversation.id,
      userId,
      content: fullResponse,
      sender: 'ai',
      personality
    });

    // Update conversation
    await updateDocument('conversations', conversation.id, {
      messageCount: (conversation.messageCount || 0) + 2,
      lastMessageAt: new Date(),
      lastMessage: fullResponse.substring(0, 100)
    });

    // Increment user request count
    await incrementUserRequestCount(userId);

    // Send completion
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      data: {
        messageId: aiMessage.id,
        remaining: req.apiLimits.remaining - 1
      }
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({
      error: 'Stream failed',
      message: 'Internal server error'
    })}\n\n`);
    res.end();
  }
});

// @route   GET /api/ai/personalities
// @desc    Get available AI personalities
// @access  Private
router.get('/personalities', async (req, res) => {
  try {
    const personalities = getPersonalities();
    
    res.json({
      success: true,
      data: personalities
    });
  } catch (error) {
    console.error('Get personalities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personalities',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/ai/analyze
// @desc    Analyze text for intent and entities
// @access  Private
router.post('/analyze', [
  body('text')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Text must be between 1 and 2000 characters')
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

    const { text } = req.body;
    const analysis = await analyzeIntent(text);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: 'Internal server error during text analysis'
    });
  }
});

module.exports = router;
