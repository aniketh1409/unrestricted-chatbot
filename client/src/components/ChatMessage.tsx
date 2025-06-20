import React, { useState } from 'react';
import './ChatMessage.css';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  isLatest?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onCopy, 
  onRegenerate, 
  isLatest 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        // Code blocks
        if (line.startsWith('```')) {
          return <div key={index} className="code-block-marker">{line}</div>;
        }
        
        // Inline code
        const codePattern = /`([^`]+)`/g;
        const parts = line.split(codePattern);
        
        return (
          <div key={index} className="message-line">
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                return <code key={partIndex} className="inline-code">{part}</code>;
              }
              return part;
            })}
          </div>
        );
      });
  };

  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '👤' : '🤖'}
      </div>
      
      <div className="message-bubble">
        <div className="message-header">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="message-content">
          {formatContent(message.content)}
        </div>
        
        <div className="message-actions">
          <button 
            className="action-btn copy-btn"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? '✅' : '📋'}
          </button>
          
          {message.role === 'assistant' && isLatest && onRegenerate && (
            <button 
              className="action-btn regenerate-btn"
              onClick={onRegenerate}
              title="Regenerate response"
            >
              🔄
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 