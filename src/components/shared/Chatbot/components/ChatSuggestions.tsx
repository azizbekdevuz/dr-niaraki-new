import React from "react";

import { CHAT_SUGGESTIONS } from "../constants";
import { SuggestionPill } from "../SuggestionPill";

interface ChatSuggestionsProps {
  darkMode: boolean;
  onSuggestionClick: (question: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  darkMode,
  onSuggestionClick,
}) => {
  return (
    <div className="p-3 md:p-4 border-t border-primary">
      <div className="flex flex-wrap gap-2">
        {CHAT_SUGGESTIONS.map((category) =>
          category.questions.map((question, index) => (
            <SuggestionPill
              key={`${category.name}-${index}`}
              question={question}
              darkMode={darkMode}
              onClick={() => onSuggestionClick(question)}
            />
          ))
        )}
      </div>
    </div>
  );
};
