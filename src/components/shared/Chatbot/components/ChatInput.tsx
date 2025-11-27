import { motion } from "framer-motion";
import { Loader, Send } from "lucide-react";
import React, { type KeyboardEvent } from "react";

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
  darkMode: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  question,
  setQuestion,
  onSend,
  isLoading,
  disabled,
  darkMode,
  inputRef,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={`p-3 md:p-4 border-t border-primary`}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className={`flex-1 p-2 md:p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all duration-fast gpu-accelerated ${
            darkMode
              ? "bg-surface-primary text-foreground placeholder-foreground/50"
              : "bg-surface-secondary text-foreground placeholder-foreground/50"
          }`}
          rows={1}
          style={{ maxHeight: "120px" }}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={disabled}
          className={`p-2 md:p-3 rounded-full gpu-accelerated ${
            darkMode
              ? "bg-accent-tertiary text-white hover:bg-accent-tertiary/90 disabled:bg-surface-tertiary disabled:text-foreground/50"
              : "bg-accent-tertiary/90 text-white hover:bg-accent-tertiary disabled:bg-surface-tertiary disabled:text-foreground/50"
          }`}
        >
          {isLoading ? (
            <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
};
