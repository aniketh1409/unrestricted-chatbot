const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversationService');
const { generalRateLimit } = require('../middleware/rateLimit');

// Apply rate limiting to admin routes
router.use(generalRateLimit);

// Simple admin authentication (enhance this for production)
const adminAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY || 'admin123';
  const providedKey = req.header('X-Admin-Key') || req.query.adminKey;
  
  if (providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  next();
};

// Get system statistics
router.get('/stats', adminAuth, (req, res) => {
  try {
    const conversationStats = conversationService.getStats();
    const systemStats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      system: systemStats,
      conversations: conversationStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get conversation list (with pagination)
router.get('/conversations', adminAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const allConversations = Array.from(conversationService.conversations.entries())
      .map(([id, conv]) => ({
        id,
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        lastActive: conv.lastActive,
        preview: conv.messages.length > 0 ? 
          conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...' : 
          'No messages'
      }))
      .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    const paginatedConversations = allConversations.slice(offset, offset + limit);

    res.json({
      conversations: paginatedConversations,
      pagination: {
        page,
        limit,
        total: allConversations.length,
        totalPages: Math.ceil(allConversations.length / limit)
      }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get specific conversation details
router.get('/conversations/:id', adminAuth, (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = conversationService.getConversation(conversationId);
    
    if (!conversation || conversation.messages.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Delete specific conversation
router.delete('/conversations/:id', adminAuth, (req, res) => {
  try {
    const conversationId = req.params.id;
    const deleted = conversationService.conversations.delete(conversationId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully', id: conversationId });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Clean up old conversations manually
router.post('/cleanup', adminAuth, (req, res) => {
  try {
    const cleaned = conversationService.cleanupOldConversations();
    res.json({ 
      message: 'Cleanup completed',
      conversationsRemoved: cleaned 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup conversations' });
  }
});

// Health check with detailed information
router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: conversationService.conversations.size
  };

  res.json(health);
});

// Test LLM providers
router.post('/test-providers', adminAuth, async (req, res) => {
  const { getChatResponse } = require('../services/llmService');
  
  const testMessage = "Hello, this is a test message. Please respond with 'Test successful'.";
  const providers = ['openai', 'anthropic', 'local'];
  const results = {};

  for (const provider of providers) {
    try {
      const startTime = Date.now();
      const response = await getChatResponse({
        message: testMessage,
        conversation: [],
        provider,
        systemPrompt: "You are a test assistant. Keep responses brief."
      });
      const endTime = Date.now();
      
      results[provider] = {
        status: 'success',
        response: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
        responseTime: endTime - startTime
      };
    } catch (error) {
      results[provider] = {
        status: 'error',
        error: error.message
      };
    }
  }

  res.json({
    testMessage,
    results,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 