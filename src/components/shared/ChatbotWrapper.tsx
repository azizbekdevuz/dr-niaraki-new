'use client';

import dynamic from 'next/dynamic';
import React from 'react';

import ChatbotLoader from './ChatbotLoader';

// Performance: Lazy load Chatbot component
const Chatbot = dynamic(() => import('./Chatbot/Chatbot'), {
  loading: () => <ChatbotLoader />,
  ssr: false
});

export default function ChatbotWrapper() {
  return <Chatbot />;
} 