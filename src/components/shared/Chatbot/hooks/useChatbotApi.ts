import { useCallback, useState } from 'react';

import { CHAT_CONFIG } from '../constants';
import type { Message } from '../types';

interface UseChatbotApiOptions {
  sessionId: string | null;
  addMessage: (message: Message) => void;
  setIsTypingEffect: (isTyping: boolean) => void;
}

export function useChatbotApi({ sessionId, addMessage, setIsTypingEffect }: UseChatbotApiOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = useCallback(async (question: string) => {
    if (!question.trim() || !sessionId) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      type: "user",
      text: question,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    setIsLoading(true);
    setIsTypingEffect(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question,
          sessionId 
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();

      // Simulated delay to mimic typing
      setTimeout(() => {
        setIsTypingEffect(false);
        const botMessage: Message = {
          type: "bot",
          text: data.answer,
          timestamp: Date.now(),
        };
        addMessage(botMessage);
      }, CHAT_CONFIG.TYPING_DELAY);
    } catch (error) {
      console.error("Error sending question:", error);

      setTimeout(() => {
        setIsTypingEffect(false);
        const errorMessage: Message = {
          type: "bot",
          text: "Sorry, I encountered an error while processing your question. Please try again later.",
          timestamp: Date.now(),
        };
        addMessage(errorMessage);
      }, CHAT_CONFIG.TYPING_DELAY);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, addMessage, setIsTypingEffect]);

  return { sendQuestion, isLoading };
}

