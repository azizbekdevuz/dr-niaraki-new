/**
 * Patents parser - extracts patent entries from CV text
 * Conservative extraction with warnings for ambiguous fields
 */

import type { Patent, MutablePatent } from '@/types/details';
import type { ParseWarning, ParseResult } from '@/types/parser';

import {
  generateStableId,
  extractYear,
  extractPatentNumber,
  splitEntries,
  createWarning,
  determinePatentStatus,
  determinePatentType,
} from './parserUtils';

/**
 * Splits a patents section where each entry begins with US/KR/application markers
 * (Sejong-style CV), instead of relying on generic splitEntries heuristics alone.
 */
function splitPatentSectionIntoEntries(text: string): string[] {
  const raw = text.replace(/\r/g, '').trim();
  if (!raw) {
    return [];
  }

  const blocks = raw.split(
    /\n(?=[^\n]*?(?:\bUS\s+International\s+Patent\b|\bPatent\s+No\.|\bApplication\s+No\.?\b))/i,
  );
  const trimmed = blocks
    .map((b) => b.trim())
    .filter((b) => b.length > 22)
    .filter((chunk) => {
      if (extractPatentNumber(chunk)) {
        return true;
      }
      return /\b(?:Patent\s+No\.|Application\s+No|US\s+International\s+Patent)/i.test(chunk);
    });
  if (trimmed.length >= 4) {
    return trimmed;
  }

  const byAppOnly = raw.split(/\n(?=Application\s+No\.?\s*\d)/i);
  const t2 = byAppOnly
    .map((b) => b.trim())
    .filter((b) => b.length > 22)
    .filter((chunk) => {
      if (extractPatentNumber(chunk)) {
        return true;
      }
      return /\b(?:Patent\s+No\.|Application\s+No|US\s+International\s+Patent)/i.test(chunk);
    });
  if (t2.length >= 4) {
    return t2;
  }

  return splitEntries(raw);
}

/**
 * Parses patents section text into structured data
 */
export function parsePatents(text: string): ParseResult<Patent[]> {
  const warnings: ParseWarning[] = [];
  const patents: Patent[] = [];
  
  // Remove section headers
  const cleanedText = text
    .replace(/^(?:PATENTS|REGISTERED|COMPLETED)[\s:]*\n/gi, '')
    .replace(/\n(?:PATENTS|REGISTERED|COMPLETED)[\s:]*\n/gi, '\n')
    .trim();
  
  // Split into individual entries
  const entries = splitPatentSectionIntoEntries(cleanedText);
  
  // If no entries found, try more aggressive splitting
  let finalEntries = entries;
  if (entries.length === 0 || entries.length === 1) {
    // Try splitting by line breaks that look like new entries
    const lines = cleanedText.split('\n').filter(l => l.trim().length > 15);
    const potentialEntries: string[] = [];
    let currentEntry = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      // Check if this looks like the start of a new entry
      const prevLine = i > 0 ? lines[i - 1]?.trim() : '';
      const looksLikeNewEntry = /^\d+[\.\)]\s/.test(line) || 
                                 /^[•·\-\*]\s/.test(line) ||
                                 /(?:US|KR|Patent|Application)[\s#:]/i.test(line) ||
                                 (line.length > 40 && /^[A-Z]/.test(line) && i > 0 && prevLine && prevLine.length > 40);
      
      if (looksLikeNewEntry && currentEntry.length > 30) {
        potentialEntries.push(currentEntry.trim());
        currentEntry = line;
      } else {
        currentEntry += (currentEntry ? '\n' : '') + line;
      }
    }
    
    if (currentEntry.trim().length > 30) {
      potentialEntries.push(currentEntry.trim());
    }
    
    if (potentialEntries.length > entries.length) {
      finalEntries = potentialEntries;
    }
  }
  
  if (finalEntries.length === 0) {
    warnings.push(createWarning(
      'patents',
      'No patent entries detected in text',
      'info'
    ));
    return { data: [], warnings };
  }
  
  finalEntries.forEach((entry, index) => {
    const patent = parsePatentEntry(entry, index, warnings);
    if (patent) {
      patents.push(patent);
    }
  });
  
  return { data: patents, warnings };
}

/**
 * Parses a single patent entry
 */
function parsePatentEntry(
  text: string,
  index: number,
  warnings: ParseWarning[]
): Patent | null {
  const trimmed = text.trim();
  
  if (trimmed.length < 20) {
    return null;
  }
  
  const patent: MutablePatent = {
    id: generateStableId(trimmed, index),
    title: '',
    inventors: null,
    number: null,
    country: null,
    date: null,
    status: null,
    type: null,
    link: null,
    raw: trimmed,
  };
  
  // Extract patent number
  const patentNumber = extractPatentNumber(trimmed);
  if (patentNumber) {
    patent.number = patentNumber;
  } else {
    warnings.push(createWarning(
      'patents',
      `Patent ${index + 1}: patent number not found — please review`,
      'warning',
      index,
      trimmed.slice(0, 100)
    ));
  }
  
  // Extract date
  const dateMatch = trimmed.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/i);
  if (dateMatch) {
    patent.date = dateMatch[0];
  } else {
    // Try year-month-day format
    const altDateMatch = trimmed.match(/\d{4}[-\.\/]\d{1,2}[-\.\/]\d{1,2}/);
    if (altDateMatch) {
      patent.date = altDateMatch[0];
    } else {
      // Extract just year
      const year = extractYear(trimmed);
      if (year) {
        patent.date = year.toString();
      }
    }
  }
  
  // Determine status
  patent.status = determinePatentStatus(trimmed);
  
  // Determine type
  patent.type = determinePatentType(trimmed);
  
  // Determine country
  if (/\bUS\b|United States|International/.test(trimmed)) {
    patent.country = 'US';
  } else if (/Korea|Korean|한국/.test(trimmed)) {
    patent.country = 'Korea';
  }
  
  // Extract title - look for "Title:" pattern or quoted text
  const titlePatterns = [
    /Title:\s*"?([^"\n]+)"?/i,
    /"([^"]{20,})"/,
    /"([^"]{20,})"/,
  ];
  
  for (const pattern of titlePatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      patent.title = match[1]?.trim() ?? '';
      break;
    }
  }
  
  // Fallback title extraction
  if (!patent.title) {
    // Remove patent number and status info, use remaining as title
    const title = trimmed
      .replace(/(?:US\s*)?(?:Patent\s*(?:No\.?)?\s*)?\d{1,3}[,.]?\d{3}[,.]?\d{3}(?:[A-Z]\d)?/gi, '')
      .replace(/10-\d{7}/g, '')
      .replace(/(?:Registered|Pending|Completed|Application)[^,]*/gi, '')
      .replace(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/gi, '')
      .trim();
    
    // Get first meaningful sentence
    const firstSentence = title.split(/[.\n]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 20) {
      patent.title = firstSentence;
    } else {
      patent.title = title.slice(0, 200) || `Patent Entry ${index + 1}`;
      warnings.push(createWarning(
        'patents',
        `Patent ${index + 1}: title unclear — please review`,
        'warning',
        index
      ));
    }
  }
  
  // Extract inventors
  const inventorsMatch = trimmed.match(/Inventors?:\s*([^\n]+)/i);
  if (inventorsMatch) {
    patent.inventors = inventorsMatch[1]?.trim() ?? '';
  } else {
    // Look for common inventor name patterns
    const namePattern = /([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,3}(?:\s*,\s*[A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,3})*)/;
    const nameMatch = trimmed.match(namePattern);
    if (nameMatch) {
      patent.inventors = nameMatch[1];
    }
  }
  
  return patent as Patent;
}

/**
 * Categorizes patents into registered and pending
 */
export function categorizePatents(patents: Patent[]): {
  registered: Patent[];
  pending: Patent[];
  other: Patent[];
} {
  return {
    registered: patents.filter(p => p.status === 'registered' || p.status === 'completed'),
    pending: patents.filter(p => p.status === 'pending'),
    other: patents.filter(p => p.status !== 'registered' && p.status !== 'pending' && p.status !== 'completed'),
  };
}
