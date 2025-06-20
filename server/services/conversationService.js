const fs = require('fs').promises;
const path = require('path');

class ConversationService {
  constructor() {
    this.conversations = new Map();
    this.maxConversationLength = 50; // Maximum messages per conversation
    this.maxConversationAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.conversationsDir = path.join(__dirname, '../data/conversations');
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.conversationsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create conversations directory:', error);
    }
  }

  // Generate a unique conversation ID
  generateConversationId(ip = 'anonymous') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${ip.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${random}`;
  }

  // Get conversation by ID
  getConversation(conversationId) {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      return {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        lastActive: new Date()
      };
    }

    // Check if conversation is too old
    const now = Date.now();
    if (now - conversation.lastActive.getTime() > this.maxConversationAge) {
      this.conversations.delete(conversationId);
      return {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        lastActive: new Date()
      };
    }

    return conversation;
  }

  // Add message to conversation
  addMessage(conversationId, message) {
    let conversation = this.getConversation(conversationId);
    
    conversation.messages.push({
      ...message,
      timestamp: new Date()
    });

    // Trim conversation if too long
    if (conversation.messages.length > this.maxConversationLength) {
      const excessMessages = conversation.messages.length - this.maxConversationLength;
      conversation.messages.splice(0, excessMessages);
    }

    conversation.lastActive = new Date();
    this.conversations.set(conversationId, conversation);

    return conversation;
  }

  // Get conversation context for LLM
  getConversationContext(conversationId, maxMessages = 20) {
    const conversation = this.getConversation(conversationId);
    
    // Return recent messages for context
    const recentMessages = conversation.messages
      .slice(-maxMessages)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    return recentMessages;
  }

  // Save conversation to disk (optional persistence)
  async saveConversation(conversationId) {
    try {
      const conversation = this.conversations.get(conversationId);
      if (!conversation) return;

      const filePath = path.join(this.conversationsDir, `${conversationId}.json`);
      await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  // Load conversation from disk
  async loadConversation(conversationId) {
    try {
      const filePath = path.join(this.conversationsDir, `${conversationId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const conversation = JSON.parse(data);
      
      // Convert date strings back to Date objects
      conversation.createdAt = new Date(conversation.createdAt);
      conversation.lastActive = new Date(conversation.lastActive);
      conversation.messages.forEach(msg => {
        msg.timestamp = new Date(msg.timestamp);
      });

      this.conversations.set(conversationId, conversation);
      return conversation;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return null;
    }
  }

  // Clean up old conversations
  cleanupOldConversations() {
    const now = Date.now();
    const expiredIds = [];

    for (const [id, conversation] of this.conversations) {
      if (now - conversation.lastActive.getTime() > this.maxConversationAge) {
        expiredIds.push(id);
      }
    }

    expiredIds.forEach(id => {
      this.conversations.delete(id);
      console.log(`Cleaned up expired conversation: ${id}`);
    });

    return expiredIds.length;
  }

  // Get conversation statistics
  getStats() {
    const totalConversations = this.conversations.size;
    const totalMessages = Array.from(this.conversations.values())
      .reduce((sum, conv) => sum + conv.messages.length, 0);

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0
    };
  }
}

// Cleanup old conversations every hour
const conversationService = new ConversationService();
setInterval(() => {
  conversationService.cleanupOldConversations();
}, 60 * 60 * 1000); // 1 hour

module.exports = conversationService; 