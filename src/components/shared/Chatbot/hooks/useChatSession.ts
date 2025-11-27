import { useEffect, useState } from 'react';

const SESSION_STORAGE_KEY = 'chatSessionId';

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedId) {
      storedId = `session_${Date.now()}`;
      localStorage.setItem(SESSION_STORAGE_KEY, storedId);
    }
    setSessionId(storedId);
  }, []);

  const resetSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    const newSessionId = `session_${Date.now()}`;
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    setSessionId(newSessionId);
  };

  return { sessionId, resetSession };
}

