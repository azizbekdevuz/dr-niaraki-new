export interface ConversationContext {
  lastQuestion?: string;
  lastResponse?: string;
  topic?: string;
  followUpCount: number;
  previousTopics: string[];
  userInterests: Set<string>;
  conversationStartTime: number;
  lastInteractionTime: number;
}

export interface SemanticPattern {
  category: string;
  patterns: RegExp[];
  response: string;
  followUp: string;
}

