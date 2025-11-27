import { Bot } from "lucide-react";
import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-2 md:p-3 rounded-xl mr-auto">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent-tertiary flex items-center justify-center">
        <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
      </div>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-tertiary animate-bounce" />
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-tertiary animate-bounce delay-100" />
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-tertiary animate-bounce delay-200" />
      </div>
    </div>
  );
};
