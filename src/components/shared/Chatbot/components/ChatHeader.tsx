import { Bot, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  darkMode: boolean;
  isMinimized: boolean;
  onToggleMinimize: (e: React.MouseEvent) => void;
  onClose: () => void;
  onReset: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  darkMode,
  isMinimized,
  onToggleMinimize,
  onClose,
  onReset,
}) => {
  return (
    <div
      className={`p-3 md:p-4 rounded-t-2xl flex items-center justify-between ${
        darkMode ? "bg-surface-primary" : "bg-surface-secondary"
      }`}
    >
      <div className="flex items-center gap-2">
        <Bot className={`w-4 h-4 md:w-5 md:h-5 ${darkMode ? "text-accent-tertiary" : "text-accent-tertiary"}`} />
        <span className={`font-semibold text-sm md:text-base ${darkMode ? "text-foreground" : "text-foreground"}`}>
          Research Assistant
        </span>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={onReset}
          className={`p-1 md:p-1.5 rounded-full hover:bg-surface-hover transition-colors duration-fast gpu-accelerated ${
            darkMode ? "" : ""
          }`}
          title="Reset conversation"
        >
          <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${darkMode ? "text-foreground/60" : "text-foreground/60"}`} />
        </button>
        <button
          onClick={onToggleMinimize}
          className={`p-1 md:p-1.5 rounded-full hover:bg-surface-hover transition-colors duration-fast gpu-accelerated ${
            darkMode ? "" : ""
          }`}
        >
          {isMinimized ? (
            <ChevronUp className={`w-3 h-3 md:w-4 md:h-4 ${darkMode ? "text-foreground/60" : "text-foreground/60"}`} />
          ) : (
            <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 ${darkMode ? "text-foreground/60" : "text-foreground/60"}`} />
          )}
        </button>
        <button
          onClick={onClose}
          className={`p-1 md:p-1.5 rounded-full hover:bg-surface-hover transition-colors duration-fast gpu-accelerated ${
            darkMode ? "" : ""
          }`}
        >
          <X className={`w-3 h-3 md:w-4 md:h-4 ${darkMode ? "text-foreground/60" : "text-foreground/60"}`} />
        </button>
      </div>
    </div>
  );
};
