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
 * Parses patents section text into structured data
 */
export function parsePatents(text: string): ParseResult<Patent[]> {
  const warnings: ParseWarning[] = [];
  const patents: Patent[] = [];
  
  // Split into individual entries
  const entries = splitEntries(text);
  
  if (entries.length === 0) {
    warnings.push(createWarning(
      'patents',
      'No patent entries detected in text',
      'warning'
    ));
    return { data: [], warnings };
  }
  
  entries.forEach((entry, index) => {
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
    let title = trimmed
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

