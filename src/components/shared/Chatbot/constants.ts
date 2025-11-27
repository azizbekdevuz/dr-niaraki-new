import type { SuggestionCategory } from './types';

export const CHAT_SUGGESTIONS: SuggestionCategory[] = [
  {
    name: "Research",
    questions: [
      "What are Dr. Sadeghi's main research areas?",
    ],
  },
  {
    name: "Education",
    questions: [
      "What is his educational background?",
    ],
  },
  {
    name: "Publications",
    questions: [
      "How many papers has he published?",
    ],
  },
  {
    name: "Experience",
    questions: [
      "Tell me about his teaching experience",
    ],
  },
];

export const INITIAL_BOT_MESSAGE = "Hi there! I'm Dr. Sadeghi-Niaraki's research assistant. How can I help you?";

export const CHAT_CONFIG = {
  TYPING_DELAY: 800,
  SCROLL_DELAY: 50,
  FOCUS_DELAY: 300,
} as const;

