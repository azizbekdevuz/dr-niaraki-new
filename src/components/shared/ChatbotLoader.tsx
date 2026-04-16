'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import React from 'react';

export default function ChatbotLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[50] p-3 md:p-4 rounded-full shadow-chatbot-loader glass-static gpu-accelerated"
    >
      <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-accent-tertiary animate-pulse" />
    </motion.div>
  );
}
