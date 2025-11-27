/**
 * Parser utility functions for DOCX parsing
 * Provides helpers for text normalization, ID generation, and pattern matching
 */

import crypto from 'crypto';

import type { ParseWarning, SectionType, DetectedSection } from '@/types/parser';

/**
 * Normalizes whitespace in text
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generates a stable ID from text using slug + short hash
 */
export function generateStableId(text: string, index?: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  
  const hash = crypto
    .createHash('md5')
    .update(text + (index ?? ''))
    .digest('hex')
    .slice(0, 8);
  
  return `${slug}-${hash}`;
}

/**
 * Extracts year from text using various patterns
 */
export function extractYear(text: string): number | null {
  // Try patterns like (2024), 2024, 2024., etc.
  const patterns = [
    /\((\d{4})\)/,           // (2024)
    /\b(19\d{2}|20\d{2})\b/, // 1999 or 20XX
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1] ?? '', 10);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        return year;
      }
    }
  }
  
  return null;
}

/**
 * Extracts DOI from text
 */
export function extractDoi(text: string): string | null {
  const doiPattern = /\b(10\.\d{4,}(?:\.\d+)*\/[^\s]+)\b/i;
  const match = text.match(doiPattern);
  return match ? match[1] ?? null : null;
}

/**
 * Extracts email addresses from text
 */
export function extractEmails(text: string): string[] {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailPattern) || [];
}

/**
 * Extracts phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
  const matches = text.match(phonePattern) || [];
  return matches.filter(p => p.replace(/\D/g, '').length >= 7);
}

/**
 * Extracts URLs from text
 */
export function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"\]]+/gi;
  return text.match(urlPattern) || [];
}

/**
 * Extracts patent number from text
 */
export function extractPatentNumber(text: string): string | null {
  const patterns = [
    /US\s*(?:Patent\s*(?:No\.?)?\s*)?(\d{1,3}[,.]?\d{3}[,.]?\d{3}(?:[A-Z]\d)?)/i,
    /(?:Patent\s*(?:No\.?)?\s*)?(\d{2}-\d{7})/i,
    /(?:Application\s*No\.?\s*)?(\d{2}-\d{4}-\d{7})/i,
    /(10-\d{7})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return null;
}

/**
 * Determines if text is likely a section header
 */
export function isSectionHeader(text: string): boolean {
  const trimmed = text.trim();
  
  // Check for known section keywords
  const sectionKeywords = [
    'education', 'experience', 'publications', 'patents', 
    'research', 'awards', 'skills', 'contact', 'summary',
    'qualifications', 'appointments', 'grants', 'students',
    'teaching', 'services', 'workshops', 'professional',
    'academic', 'career', 'positions', 'honors', 'books',
    'journal', 'conference', 'membership', 'leadership'
  ];
  
  const lowerText = trimmed.toLowerCase();
  
  // Check if it matches section patterns
  if (sectionKeywords.some(kw => lowerText.includes(kw))) {
    // Likely a header if:
    // - All uppercase
    // - Ends with colon
    // - Short (under 100 chars)
    // - Starts with common header words
    if (
      trimmed === trimmed.toUpperCase() ||
      trimmed.endsWith(':') ||
      trimmed.length < 100
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Maps text to section type
 */
export function detectSectionType(text: string): SectionType {
  const lower = text.toLowerCase();
  
  const mappings: Array<{ keywords: string[]; type: SectionType }> = [
    { keywords: ['professional summary', 'summary', 'profile', 'overview', 'summary of qualifications'], type: 'summary' },
    { keywords: ['academic qualifications', 'education', 'academic qualification', 'degree', 'ph.d', 'phd', 'm.sc', 'msc', 'b.sc', 'bsc'], type: 'education' },
    { keywords: ['professional work experiences', 'academic appointments', 'experience', 'appointment', 'position', 'employment', 'work', 'associate professor', 'assistant professor', 'research professor'], type: 'experience' },
    { keywords: ['journal papers', 'publications', 'publication', 'journal paper', 'article', 'peer-reviewed', 'books and book chapters', 'books', 'book chapters', 'conference papers', 'conferences'], type: 'publications' },
    { keywords: ['patents', 'patent'], type: 'patents' },
    { keywords: ['research projects experiences', 'research project', 'research interest', 'research area', 'research grants'], type: 'research' },
    { keywords: ['awards & honors', 'awards and honors', 'award', 'honor', 'recognition', 'achievement'], type: 'awards' },
    { keywords: ['skills', 'skill', 'expertise', 'competenc', 'research & academic skills', 'research leadership'], type: 'skills' },
    { keywords: ['contact', 'email', 'phone', 'address', 'website', 'linkedin'], type: 'contact' },
    { keywords: ['student', 'supervision', 'mentee', 'advisee'], type: 'students' },
    { keywords: ['research grants and achievements', 'grant', 'funding', 'research grant'], type: 'grants' },
    { keywords: ['workshops and exhibitions', 'workshop', 'exhibition', 'presentation', 'workshop organization'], type: 'workshops' },
    { keywords: ['teaching experiences', 'teaching', 'editorial', 'review', 'committee', 'service', 'journal and conference reviews'], type: 'services' },
  ];
  
  for (const { keywords, type } of mappings) {
    if (keywords.some(kw => lower.includes(kw))) {
      return type;
    }
  }
  
  return 'unknown';
}

/**
 * Splits text into sections based on detected headers
 */
export function splitIntoSections(text: string): DetectedSection[] {
  const lines = text.split('\n');
  const sections: DetectedSection[] = [];
  let currentSection: DetectedSection | null = null;
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (isSectionHeader(trimmed) && trimmed.length > 0) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim(),
        });
      }
      
      // Start new section
      const sectionType = detectSectionType(trimmed);
      currentSection = {
        type: sectionType,
        title: trimmed,
        content: '',
        confidence: sectionType === 'unknown' ? 0.5 : 0.8,
      };
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentContent.join('\n').trim(),
    });
  }
  
  return sections;
}

/**
 * Splits publication/patent entries by bullet or double newline
 */
export function splitEntries(text: string): string[] {
  // Minimum entry length to filter out noise (but not short valid entries)
  const MIN_ENTRY_LENGTH = 10;
  
  // Try splitting by numbered entries first (more flexible pattern)
  const numberedPattern = /(?:^|\n)\s*(\d+)[\.\)]\s+/gm;
  const numberedMatches = [...text.matchAll(numberedPattern)];
  if (numberedMatches.length >= 2) {
    const entries: string[] = [];
    for (let i = 0; i < numberedMatches.length; i++) {
      const match = numberedMatches[i];
      if (!match || match.index === undefined) {
        continue;
      }
      const start = match.index + match[0].length;
      const nextMatch = i < numberedMatches.length - 1 ? numberedMatches[i + 1] : null;
      const end = nextMatch?.index ?? text.length;
      const entry = text.slice(start, end).trim();
      if (entry.length > MIN_ENTRY_LENGTH) {
        entries.push(entry);
      }
    }
    if (entries.length > 0) {
      return entries;
    }
  }
  
  // Try splitting by bullets
  const bulletPattern = /(?:^|\n)\s*[•·\-\*]\s+/gm;
  const bulletMatches = [...text.matchAll(bulletPattern)];
  if (bulletMatches.length >= 2) {
    const entries: string[] = [];
    for (let i = 0; i < bulletMatches.length; i++) {
      const match = bulletMatches[i];
      if (!match || match.index === undefined) {
        continue;
      }
      const start = match.index + match[0].length;
      const nextMatch = i < bulletMatches.length - 1 ? bulletMatches[i + 1] : null;
      const end = nextMatch?.index ?? text.length;
      const entry = text.slice(start, end).trim();
      if (entry.length > MIN_ENTRY_LENGTH) {
        entries.push(entry);
      }
    }
    if (entries.length > 0) {
      return entries;
    }
  }
  
  // Try splitting by lines that look like new entries (capitalized, long lines)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 3) {
    const entries: string[] = [];
    let currentEntry = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      // Check if this looks like start of new entry
      const isNewEntry = i > 0 && (
        /^[A-Z][A-Za-z\s]{20,}/.test(line) && // Starts with capital, long line
        currentEntry.length > 50 && // Previous entry was substantial
        !line.match(/^(?:and|the|in|on|at|for|with|by|from|to)\s/i) // Not a continuation word
      );
      
      if (isNewEntry && currentEntry.length > MIN_ENTRY_LENGTH) {
        entries.push(currentEntry.trim());
        currentEntry = line;
      } else {
        currentEntry += (currentEntry ? '\n' : '') + line;
      }
    }
    
    if (currentEntry.trim().length > MIN_ENTRY_LENGTH) {
      entries.push(currentEntry.trim());
    }
    
    if (entries.length > 1) {
      return entries;
    }
  }
  
  // Fall back to double newlines
  return text
    .split(/\n\n+/)
    .map(e => e.trim())
    .filter(e => e.length > MIN_ENTRY_LENGTH);
}

/**
 * Creates a warning message
 */
export function createWarning(
  field: string,
  message: string,
  severity: ParseWarning['severity'] = 'warning',
  index?: number,
  raw?: string
): ParseWarning {
  return { field, message, severity, index, raw };
}

/**
 * Extracts journal name from publication text
 */
export function extractJournalName(text: string): string | null {
  // Common patterns for journal names
  const patterns = [
    /(?:published in|in:?)\s*([^,\.\d]+?)(?:,|\.|Vol|Volume|\d)/i,
    /([A-Z][a-zA-Z\s&]+(?:Journal|Review|Letters|Science|Research|Studies)[^,\.]*)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim() ?? null;
    }
  }
  
  return null;
}

/**
 * Determines publication type from text
 */
export function determinePublicationType(text: string): 'journal' | 'conference' | 'book' | 'chapter' | 'other' {
  const lower = text.toLowerCase();
  
  if (lower.includes('conference') || lower.includes('proceedings') || lower.includes('symposium')) {
    return 'conference';
  }
  if (lower.includes('book chapter') || lower.includes('chapter in')) {
    return 'chapter';
  }
  if (lower.includes('book') && !lower.includes('book chapter')) {
    return 'book';
  }
  if (lower.includes('journal') || lower.includes('scie') || lower.includes('ssci')) {
    return 'journal';
  }
  
  return 'other';
}

/**
 * Extracts authors from citation text
 */
export function extractAuthors(text: string): string | null {
  // Pattern: Authors before year in parentheses
  const pattern = /^([^(]+?)(?:\s*\(?\d{4}\)?)/;
  const match = text.match(pattern);
  
  if (match) {
    const authors = match[1]?.trim() ?? '';
    // Validate it looks like author names
    if (authors.includes(',') || authors.includes('&') || authors.includes('and')) {
      return authors;
    }
  }
  
  return null;
}

/**
 * Determines patent status from text
 */
export function determinePatentStatus(text: string): 'registered' | 'pending' | 'completed' | 'expired' | null {
  const lower = text.toLowerCase();
  
  if (lower.includes('registered') || lower.includes('granted')) {
    return 'registered';
  }
  if (lower.includes('pending') || lower.includes('under examination') || lower.includes('application')) {
    return 'pending';
  }
  if (lower.includes('completed') || lower.includes('issued')) {
    return 'completed';
  }
  if (lower.includes('expired')) {
    return 'expired';
  }
  
  return null;
}

/**
 * Determines patent type from text
 */
export function determinePatentType(text: string): 'international' | 'korean' | 'other' | null {
  const lower = text.toLowerCase();
  
  if (lower.includes('us patent') || lower.includes('international patent') || lower.includes('us ')) {
    return 'international';
  }
  if (lower.includes('korean') || lower.includes('korea') || /10-\d{7}/.test(text)) {
    return 'korean';
  }
  
  return 'other';
}
