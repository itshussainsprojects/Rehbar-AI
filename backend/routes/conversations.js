const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { 
  createDocument, 
  getDocument, 
  updateDocument, 
  deleteDocument,
  queryDocuments 
} = require('../config/firebase');
const { generateSummary, generateTitle } = require('../config/gemini');

const router = express.Router();

// @route   GET /api/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search query too long')
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;

    let filters = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'isActive', operator: '==', value: true }
    ];

    // Add search filter if provided
    if (search) {
      filters.push({ field: 'title', operator: '>=', value: search });
      filters.push({ field: 'title', operator: '<=', value: search + '\uf8ff' });
    }

    // Get conversations with pagination
    const conversations = await queryDocuments(
      'conversations',
      filters,
      { field: 'updatedAt', direction: 'desc' },
      limit
    );

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await queryDocuments('messages', [
          { field: 'conversationId', operator: '==', value: conversation.id }
        ]);

        return {
          ...conversation,
          messageCount: messages.length,
          lastMessage: conversation.lastMessage || null,
          lastMessageAt: conversation.lastMessageAt || conversation.updatedAt
        };
      })
    );

    res.json({
      success: true,
      data: {
        conversations: conversationsWithCounts,
        pagination: {
          page,
          limit,
          total: conversationsWithCounts.length,
          hasMore: conversationsWithCounts.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/conversations
// @desc    Create new conversation
// @access  Private
router.post('/', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('personality')
    .optional()
    .isIn(['helpful', 'creative', 'professional', 'casual', 'technical'])
    .withMessage('Invalid personality type')
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

    const { title = 'New Conversation', personality = 'helpful' } = req.body;
    const userId = req.userId;

    const conversation = await createDocument('conversations', {
      userId,
      title,
      personality,
      messageCount: 0,
      isActive: true,
      lastMessageAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get specific conversation with messages
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.userId;

    // Get conversation
    const conversation = await getDocument('conversations', conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        message: 'The requested conversation does not exist'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this conversation'
      });
    }

    // Get messages
    const messages = await queryDocuments('messages', [
      { field: 'conversationId', operator: '==', value: conversationId }
    ], { field: 'createdAt', direction: 'asc' });

    res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/conversations/:id
// @desc    Update conversation
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('personality')
    .optional()
    .isIn(['helpful', 'creative', 'professional', 'casual', 'technical'])
    .withMessage('Invalid personality type')
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

    const conversationId = req.params.id;
    const userId = req.userId;
    const updates = req.body;

    // Get conversation
    const conversation = await getDocument('conversations', conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        message: 'The requested conversation does not exist'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to update this conversation'
      });
    }

    // Update conversation
    const updatedConversation = await updateDocument('conversations', conversationId, updates);

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      data: updatedConversation
    });

  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/conversations/:id
// @desc    Delete conversation
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.userId;

    // Get conversation
    const conversation = await getDocument('conversations', conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        message: 'The requested conversation does not exist'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to delete this conversation'
      });
    }

    // Soft delete - mark as inactive
    await updateDocument('conversations', conversationId, {
      isActive: false,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/conversations/:id/summary
// @desc    Generate conversation summary
// @access  Private
router.post('/:id/summary', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.userId;

    // Get conversation
    const conversation = await getDocument('conversations', conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        message: 'The requested conversation does not exist'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this conversation'
      });
    }

    // Get messages
    const messages = await queryDocuments('messages', [
      { field: 'conversationId', operator: '==', value: conversationId }
    ], { field: 'createdAt', direction: 'asc' });

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No messages found',
        message: 'Cannot generate summary for empty conversation'
      });
    }

    // Generate summary
    const summary = await generateSummary(messages);

    // Update conversation with summary
    await updateDocument('conversations', conversationId, {
      summary
    });

    res.json({
      success: true,
      message: 'Summary generated successfully',
      data: {
        summary
      }
    });

  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/conversations/:id/export
// @desc    Export conversation
// @access  Private
router.get('/:id/export', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.userId;
    const format = req.query.format || 'json';

    // Get conversation
    const conversation = await getDocument('conversations', conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        message: 'The requested conversation does not exist'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this conversation'
      });
    }

    // Get messages
    const messages = await queryDocuments('messages', [
      { field: 'conversationId', operator: '==', value: conversationId }
    ], { field: 'createdAt', direction: 'asc' });

    const exportData = {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        messageCount: messages.length
      },
      messages: messages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.createdAt
      }))
    };

    if (format === 'txt') {
      let textContent = `Conversation: ${conversation.title}\n`;
      textContent += `Created: ${conversation.createdAt}\n\n`;
      
      messages.forEach(msg => {
        textContent += `${msg.sender.toUpperCase()}: ${msg.content}\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${conversation.title}.txt"`);
      res.send(textContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${conversation.title}.json"`);
      res.json(exportData);
    }

  } catch (error) {
    console.error('Export conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export conversation',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
