export const RESPONSE_TEMPLATES = {
  greeting: [
    "Hello! I'm Dr. Niaraki's research assistant. How can I help you learn more about his professional background?",
    "Hi there! I'd be happy to tell you about Dr. Niaraki's work and achievements. What would you like to know?",
    "Welcome! I'm here to help you learn about Dr. Niaraki's research and expertise. What interests you?",
    "Greetings! I can tell you about Dr. Niaraki's academic journey, research, and achievements. What would you like to explore?",
    "Hello! I'm here to share insights about Dr. Niaraki's work in Geo-AI, XR technologies, and academic leadership. What would you like to know?"
  ],
  followUp: [
    "Would you like to know more about {topic}?",
    "I can tell you more about {topic} if you're interested.",
    "There's more to share about {topic}. Would you like to hear it?",
    "I notice you're interested in {topic}. Would you like to explore this further?",
    "Since you asked about {topic}, I can provide more specific details if you'd like."
  ],
  clarification: [
    "Could you please be more specific about what you'd like to know?",
    "I want to make sure I give you the most relevant information. Could you elaborate on your question?",
    "That's an interesting topic. Could you tell me more about what aspects you're interested in?",
    "To provide the most helpful response, could you clarify your question about {topic}?",
    "I'd like to ensure I address your specific interests. Could you provide more details about your question?"
  ],
  notFound: [
    "I don't have specific information about that, but I can tell you about Dr. Niaraki's {topics}.",
    "While I don't have details on that, I'd be happy to share information about his {topics}.",
    "I'm not sure about that specific detail, but I can tell you about his {topics}.",
    "That's an interesting question, but I can better assist you with information about his {topics}.",
    "I'd be happy to share what I know about Dr. Niaraki's {topics} instead."
  ],
  gratitude: [
    "You're welcome! Feel free to ask if you have any other questions about Dr. Niaraki's work.",
    "Happy to help! Don't hesitate to ask if you'd like to know more about his research or achievements.",
    "My pleasure! I'm here if you have any other questions about Dr. Niaraki's professional background.",
    "Glad I could assist! Feel free to ask about any other aspects of Dr. Niaraki's work.",
    "You're welcome! I'm here to help you learn more about Dr. Niaraki's contributions to the field."
  ],
  transition: [
    "Speaking of {topic}, did you know that...",
    "This reminds me of another interesting aspect of {topic}...",
    "That's related to {topic}, which is also fascinating because...",
    "This connects to {topic} in an interesting way...",
    "This brings to mind another achievement in {topic}..."
  ],
  rateLimited: [
    "I notice you're sending many questions quickly. Please take a moment before your next question.",
    "To ensure quality responses, please wait a moment before asking another question.",
    "You've reached the question limit. Please try again in a minute."
  ]
} as const;

export const CONVERSATION_CONFIG = {
  MAX_AGE: 60 * 60 * 1000, // 1 hour
  CLEANUP_INTERVAL: 5 * 60 * 1000, // Every 5 minutes
} as const;

