export interface Message {
  type: "user" | "bot";
  text: string;
  timestamp: number;
}

export interface SuggestionCategory {
  name: string;
  questions: string[];
}