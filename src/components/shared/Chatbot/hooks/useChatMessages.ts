import { useEffect, useRef, useState } from 'react';

import { CHAT_CONFIG, INITIAL_BOT_MESSAGE } from '../constants';
import type { Message } from '../types';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      text: INITIAL_BOT_MESSAGE,
      timestamp: Date.now(),
    },
  ]);
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, CHAT_CONFIG.SCROLL_DELAY);
    }
  }, [messages, isTypingEffect]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const resetMessages = () => {
    setMessages([
      {
        type: "bot",
        text: INITIAL_BOT_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
  };

  return {
    messages,
    isTypingEffect,
    setIsTypingEffect,
    messagesEndRef,
    addMessage,
    resetMessages,
  };
}

