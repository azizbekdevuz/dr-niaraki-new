"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { ChatbotMessage } from "./ChatbotMessage";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { ChatSuggestions } from "./components/ChatSuggestions";
import { TypingIndicator } from "./components/TypingIndicator";
import { CHAT_CONFIG } from "./constants";
import { useChatbotApi } from "./hooks/useChatbotApi";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatSession } from "./hooks/useChatSession";

interface ChatbotProps {
  darkMode?: boolean;
}

export default function Chatbot({ darkMode = true }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { sessionId, resetSession } = useChatSession();
  const {
    messages,
    isTypingEffect,
    setIsTypingEffect,
    messagesEndRef,
    addMessage,
    resetMessages,
  } = useChatMessages();
  const { sendQuestion, isLoading } = useChatbotApi({
    sessionId,
    addMessage,
    setIsTypingEffect,
  });

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, CHAT_CONFIG.FOCUS_DELAY);
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (!question.trim()) {
      return;
    }
    sendQuestion(question);
    setQuestion("");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleSuggestionClick = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleReset = () => {
    resetMessages();
    resetSession();
  };

  return (
    <>
      {/* Backdrop when chat is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-overlay-medium z-[49] gpu-accelerated"
            style={{ pointerEvents: 'auto' }}
            onClick={toggleChat}
          />
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[50] p-3 md:p-4 rounded-full shadow-lg transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-accent-primary gpu-accelerated ${
          darkMode
            ? "bg-accent-tertiary text-white hover:bg-accent-tertiary/90"
            : "bg-accent-tertiary/90 text-white hover:bg-accent-tertiary"
        }`}
        style={{ boxShadow: '0 4px 24px 0 rgba(139, 92, 246, 0.15)' }}
        aria-label="Open chat assistant"
      >
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Research Assistant Chat"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 w-[calc(100vw-2rem)] md:w-[90vw] max-w-sm sm:max-w-md md:max-w-lg h-[70vh] max-h-[600px] rounded-2xl shadow-2xl flex flex-col z-[51] gpu-accelerated ${
              darkMode
                ? "glass border border-primary"
                : "bg-surface-primary border border-primary"
            }`}
            style={{ boxShadow: '0 8px 40px 0 rgba(139, 92, 246, 0.18)' }}
          >
            {/* Chat Header */}
            <ChatHeader
              darkMode={darkMode}
              isMinimized={isMinimized}
              onToggleMinimize={toggleMinimize}
              onClose={toggleChat}
              onReset={handleReset}
            />

            {/* Chat Messages */}
            <div
              className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 no-scrollbar ${
                darkMode ? "scrollbar-dark" : "scrollbar-light"
              }`}
              aria-live="polite"
            >
              {messages.map((message, index) => (
                <ChatbotMessage
                  key={`${message.timestamp}-${index}`}
                  message={message}
                  darkMode={darkMode}
                  index={index}
                  isLatest={index === messages.length - 1}
                />
              ))}
              {isTypingEffect && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {!isMinimized && (
              <ChatSuggestions
                darkMode={darkMode}
                onSuggestionClick={handleSuggestionClick}
              />
            )}

            {/* Input Area */}
            {!isMinimized && (
              <ChatInput
                question={question}
                setQuestion={setQuestion}
                onSend={handleSend}
                isLoading={isLoading}
                disabled={!question.trim() || isLoading || !sessionId}
                darkMode={darkMode}
                inputRef={inputRef}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
