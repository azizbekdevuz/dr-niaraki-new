"use client";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Copy,
  CheckCheck,
} from "lucide-react";
import React, { useRef, useState } from "react";

import type { Message } from "./types";

export const ChatbotMessage: React.FC<{
  message: Message;
  darkMode: boolean;
  index: number;
  isLatest: boolean;
}> = ({ message, darkMode, index, isLatest }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarClassName = () => {
    if (message.type === "user") {
      return darkMode 
        ? "bg-accent-secondary text-white" 
        : "bg-accent-secondary/90 text-white";
    }
    return darkMode 
      ? "bg-accent-tertiary text-white" 
      : "bg-accent-tertiary/90 text-white";
  };

  const getMessageClassName = () => {
    if (message.type === "user") {
      return darkMode
        ? "bg-accent-secondary/40 text-foreground border border-accent-secondary/50"
        : "bg-accent-secondary/20 text-foreground border border-accent-secondary/30";
    }
    // Bot message - NO backdrop-blur to prevent blurriness
    return darkMode
      ? "bg-surface-primary text-foreground border border-primary"
      : "bg-surface-secondary text-foreground border border-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className={`flex gap-2 md:gap-3 p-2 md:p-3 rounded-xl relative group gpu-accelerated ${
        message.type === "user" ? "ml-auto" : "mr-auto"
      } ${isLatest ? "animate-pulse-once" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${getAvatarClassName()}`}
      >
        {message.type === "user" ? (
          <User className="w-3 h-3 md:w-4 md:h-4" />
        ) : (
          <Bot className="w-3 h-3 md:w-4 md:h-4" />
        )}
      </div>

      <div
        className={`p-2 md:p-3 rounded-xl max-w-[85%] relative gpu-accelerated ${getMessageClassName()}`}
      >
        <div
          className={`whitespace-pre-line text-xs md:text-sm ${
            darkMode ? "text-foreground" : "text-foreground"
          }`}
        >
          {message.text}
        </div>
        
        <div className={`text-xs mt-1 ${darkMode ? "text-foreground/50" : "text-foreground/50"}`}>
          {formatTimestamp(message.timestamp)}
        </div>

        {message.type === "bot" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => copyToClipboard(message.text)}
            className={`absolute bottom-2 right-2 p-1 rounded-full group-hover:opacity-100 transition-opacity duration-fast gpu-accelerated ${
              darkMode ? "hover:bg-surface-hover" : "hover:bg-surface-hover"
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCheck className="w-3 h-3 md:w-4 md:h-4 text-success" />
            ) : (
              <Copy className="w-3 h-3 text-foreground/50" />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
