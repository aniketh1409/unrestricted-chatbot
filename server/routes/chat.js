const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/llmService');
const conversationService = require('../services/conversationService');
const { chatRateLimit } = require('../middleware/rateLimit');

// Apply chat-specific rate limiting
router.use('/', chatRateLimit);

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, conversation, provider = 'openai', model, systemPrompt, conversationId } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'anonymous';
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Incoming message: ${message.substring(0, 100)}...`);
    console.log(`🤖 Using provider: ${provider}`);

    // Get or create conversation ID
    const convId = conversationId || conversationService.generateConversationId(clientIp);
    
    // Add user message to conversation history
    conversationService.addMessage(convId, {
      role: 'user',
      content: message
    });

    // Get conversation context for better responses
    const conversationContext = conversationService.getConversationContext(convId);

    const response = await getChatResponse({
      message,
      conversation: conversationContext,
      provider,
      model,
      systemPrompt
    });

    // Add AI response to conversation history
    conversationService.addMessage(convId, {
      role: 'assistant',
      content: response
    });

    res.json({
      response,
      conversationId: convId,
      timestamp: new Date().toISOString(),
      provider,
      model
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get chat response',
      details: error.message 
    });
  }
});

// Get available models
router.get('/models', (req, res) => {
  const models = {
    openai: [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    local: [
      'deepseek-r1:8b',
      'dolphin-llama3:8b',
      'llama2',
      'codellama',
      'mistral'
    ]
  };
  
  res.json(models);
});

module.exports = router; 