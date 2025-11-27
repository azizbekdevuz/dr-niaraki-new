import type { ConversationContext } from './types';

export function getRandomResponse(template: readonly string[], context: Record<string, string> = {}): string {
  const response = template[Math.floor(Math.random() * template.length)];
  if (!response) {
    throw new Error("No response template matched.");
  }
  return response.replace(/\{(\w+)\}/g, (match, key) => context[key] || match);
}

export function detectIntent(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.match(/^(hi|hello|hey|greetings)/i)) {
    return 'greeting';
  }
  if (lowerQuestion.match(/^(thanks|thank you|appreciate)/i)) {
    return 'gratitude';
  }
  if (lowerQuestion.match(/\?$/)) {
    return 'question';
  }
  if (lowerQuestion.match(/^(tell me|can you|could you|would you|please)/i)) {
    return 'request';
  }
  if (lowerQuestion.match(/^(i want|i need|i'm looking for)/i)) {
    return 'desire';
  }
  if (lowerQuestion.match(/^(what|who|where|when|why|how)/i)) {
    return 'inquiry';
  }
  return 'statement';
}

export function findRelatedTopics(topic: string): string[] {
  const topicRelations: Record<string, string[]> = {
    'education': ['research', 'teaching', 'publications'],
    'experience': ['research', 'projects', 'teaching'],
    'research': ['publications', 'patents', 'projects'],
    'publications': ['research', 'patents', 'awards'],
    'patents': ['research', 'publications', 'projects'],
    'contact': ['experience', 'teaching', 'research'],
    'teaching': ['education', 'experience', 'research'],
    'awards': ['research', 'publications', 'experience'],
    'skills': ['research', 'projects', 'publications']
  };
  return topicRelations[topic] || [];
}

export function updateConversationContext(
  context: ConversationContext,
  question: string
): ConversationContext {
  return {
    ...context,
    lastQuestion: question,
    lastInteractionTime: Date.now(),
    previousTopics: [
      ...context.previousTopics,
      ...(context.topic ? [context.topic] : [])
    ]
  };
}

