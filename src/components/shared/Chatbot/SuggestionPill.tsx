import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import React from "react";

export const SuggestionPill: React.FC<{
  question: string;
  darkMode: boolean;
  onClick: () => void;
}> = ({ question, darkMode, onClick }) => {
  return (
    <motion.button
      aria-label={`Ask: ${question}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 gpu-accelerated ${
        darkMode
          ? "bg-surface-primary text-accent-primary border border-accent-primary/30 hover:bg-surface-hover"
          : "bg-surface-secondary text-accent-primary border border-accent-primary/30 hover:bg-surface-hover"
      }`}
      onClick={onClick}
    >
      <PlusCircle className="w-3 h-3" />
      <span>{question}</span>
    </motion.button>
  );
};
