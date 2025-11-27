import { resumeText } from '@/data/cvText';

import { RESPONSE_TEMPLATES } from './constants';
import { SEMANTIC_PATTERNS } from './patterns';
import type { ConversationContext } from './types';
import { detectIntent, findRelatedTopics, getRandomResponse, updateConversationContext } from './utils';

export function generateResponse(
  question: string,
  context: ConversationContext
): { answer: string; context: ConversationContext } {
  const intent = detectIntent(question);
  const lowerQuestion = question.toLowerCase();
  
  const newContext = updateConversationContext(context, question);

  // Handle different intents
  switch (intent) {
    case 'greeting':
      return {
        answer: getRandomResponse(RESPONSE_TEMPLATES.greeting),
        context: { ...newContext, followUpCount: 0 }
      };
    
    case 'gratitude':
      return {
        answer: getRandomResponse(RESPONSE_TEMPLATES.gratitude),
        context: { ...newContext, followUpCount: 0 }
      };
  }

  // Find matching semantic pattern
  for (const pattern of SEMANTIC_PATTERNS) {
    if (pattern.patterns.some(p => p.test(lowerQuestion))) {
      newContext.userInterests.add(pattern.category);
      
      let answer = pattern.response;
      
      // Add follow-up question if appropriate
      if (newContext.followUpCount < 2 && Math.random() < 0.7) {
        answer += `\n\n${pattern.followUp}`;
      }
      
      // Add related topic if conversation is flowing
      if (newContext.followUpCount > 0 && Math.random() < 0.3) {
        const relatedTopics = findRelatedTopics(pattern.category);
        if (relatedTopics.length > 0) {
          const relatedTopic = relatedTopics[Math.floor(Math.random() * relatedTopics.length)] as string;
          answer += `\n\n${getRandomResponse(RESPONSE_TEMPLATES.transition, { topic: relatedTopic })}`;
        }
      }

      return {
        answer,
        context: {
          ...newContext,
          topic: pattern.category,
          lastResponse: pattern.response,
          followUpCount: newContext.followUpCount + 1
        }
      };
    }
  }

  // If no pattern matches, try to find relevant sections from the CV
  const sections = (resumeText ?? "").split('####################################################################');
  const keywords = lowerQuestion.match(/\b\w{4,}\b/g) || [];
  
  const relevantSections = sections.filter(section => 
    keywords.some(keyword => section?.toLowerCase().includes(keyword))
  );

  if (relevantSections.length > 0) {
    const response = (relevantSections[0] ?? '').trim();
    const answer = response.length > 500 ? `${response.substring(0, 500)}...` : response;
    
    return {
      answer,
      context: {
        ...newContext,
        lastResponse: answer,
        followUpCount: 0
      }
    };
  }

  // If no relevant sections found, return a default response with available topics
  const availableTopics = SEMANTIC_PATTERNS.map(p => p.category).join(', ');
  return {
    answer: getRandomResponse(RESPONSE_TEMPLATES.notFound, { topics: availableTopics }),
    context: {
      ...newContext,
      followUpCount: 0
    }
  };
}

