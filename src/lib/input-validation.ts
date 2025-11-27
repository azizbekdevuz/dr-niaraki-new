// Input validation utilities for enhanced security

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

// Validate and sanitize chat input
export function validateChatInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  // Type check
  if (typeof input !== 'string') {
    return {
      isValid: false,
      errors: ['Input must be a string']
    };
  }

  // Length validation
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    errors.push('Question cannot be empty');
  }
  
  if (trimmed.length > 1000) {
    errors.push('Question is too long (max 1000 characters)');
  }

  // Check for potential injection patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /<object\b/gi,
    /<embed\b/gi,
    /<link\b/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      errors.push('Input contains potentially harmful content');
      break;
    }
  }

  // Basic profanity filter (extend as needed)
  const profanityPatterns: RegExp[] = [
    // Add patterns as needed
  ];

  for (const pattern of profanityPatterns) {
    if (pattern.test(trimmed.toLowerCase())) {
      errors.push('Input contains inappropriate content');
      break;
    }
  }

  // Sanitize by removing extra whitespace and normalizing
  const sanitized = trimmed
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 1000); // Enforce max length

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined
  };
}

// Validate session ID format
export function validateSessionId(sessionId: unknown): boolean {
  if (typeof sessionId !== 'string') {
    return false;
  }

  // Session ID should match our expected format: session_timestamp
  const sessionPattern = /^session_\d{13,}$/;
  return sessionPattern.test(sessionId);
}

// Sanitize output to prevent XSS in responses
export function sanitizeOutput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 