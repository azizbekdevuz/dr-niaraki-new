import { CONVERSATION_CONFIG } from './constants';
import type { ConversationContext } from './types';

const conversationContexts: Map<string, ConversationContext> = new Map();

export function getOrCreateContext(sessionId: string): ConversationContext {
  return conversationContexts.get(sessionId) || {
    followUpCount: 0,
    previousTopics: [],
    userInterests: new Set<string>(),
    conversationStartTime: Date.now(),
    lastInteractionTime: Date.now()
  };
}

export function saveContext(sessionId: string, context: ConversationContext): void {
  conversationContexts.set(sessionId, context);
}

// Cleanup old conversations periodically
setInterval(() => {
  const now = Date.now();
  
  for (const [sessionId, context] of conversationContexts.entries()) {
    if (now - context.lastInteractionTime > CONVERSATION_CONFIG.MAX_AGE) {
      conversationContexts.delete(sessionId);
    }
  }
}, CONVERSATION_CONFIG.CLEANUP_INTERVAL);

