/**
 * Publications parser - extracts publication entries from CV text
 * Conservative extraction with warnings for ambiguous fields
 */

import type { Publication, MutablePublication } from '@/types/details';
import type { ParseWarning, ParseResult } from '@/types/parser';

import {
  generateStableId,
  extractYear,
  extractDoi,
  splitEntries,
  createWarning,
  extractJournalName,
  determinePublicationType,
  extractAuthors,
} from './parserUtils';

/**
 * Parses publications section text into structured data
 */
export function parsePublications(text: string): ParseResult<Publication[]> {
  const warnings: ParseWarning[] = [];
  const publications: Publication[] = [];
  
  // Split into individual entries
  const entries = splitEntries(text);
  
  if (entries.length === 0) {
    warnings.push(createWarning(
      'publications',
      'No publication entries detected in text',
      'warning'
    ));
    return { data: [], warnings };
  }
  
  entries.forEach((entry, index) => {
    const publication = parsePublicationEntry(entry, index, warnings);
    if (publication) {
      publications.push(publication);
    }
  });
  
  return { data: publications, warnings };
}

/**
 * Parses a single publication entry
 */
function parsePublicationEntry(
  text: string,
  index: number,
  warnings: ParseWarning[]
): Publication | null {
  const trimmed = text.trim();
  
  if (trimmed.length < 30) {
    return null;
  }
  
  const pub: MutablePublication = {
    id: generateStableId(trimmed, index),
    title: '',
    authors: null,
    journal: null,
    year: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    link: null,
    type: null,
    impactFactor: null,
    quartile: null,
    raw: trimmed,
  };
  
  // Extract year
  const year = extractYear(trimmed);
  if (year) {
    pub.year = year;
  } else {
    warnings.push(createWarning(
      'publications',
      `Publication ${index + 1}: year not found — please review`,
      'warning',
      index,
      trimmed.slice(0, 100)
    ));
  }
  
  // Extract DOI
  const doi = extractDoi(trimmed);
  if (doi) {
    pub.doi = doi;
    pub.link = `https://doi.org/${doi}`;
  }
  
  // Extract authors
  const authors = extractAuthors(trimmed);
  if (authors) {
    pub.authors = authors;
  }
  
  // Extract journal name
  const journal = extractJournalName(trimmed);
  if (journal) {
    pub.journal = journal;
  }
  
  // Determine publication type
  pub.type = determinePublicationType(trimmed);
  
  // Extract title - try to find quoted title or first sentence
  const titleMatch = trimmed.match(/"([^"]+)"/) || trimmed.match(/"([^"]+)"/);
  if (titleMatch) {
    pub.title = titleMatch[1] ?? '';
  } else {
    // Use first part before year or period as title
    const titleEnd = trimmed.search(/\.\s*(?:\(?\d{4}|\w+\s+Journal|Vol)/i);
    if (titleEnd > 0) {
      pub.title = trimmed.slice(0, titleEnd).trim();
    } else {
      // Fallback: use first line or first 200 chars
      const firstLine = trimmed.split('\n')[0];
      if (firstLine && firstLine.length > 200) {
        pub.title = `${firstLine.slice(0, 200)}...`;
      } else {
        pub.title = firstLine ?? '';
      }
    }
  }
  
  // Extract impact factor
  const ifMatch = trimmed.match(/IF[:\s]*(\d+\.?\d*)/i);
  if (ifMatch) {
    pub.impactFactor = ifMatch[1];
  }
  
  // Extract quartile
  const qMatch = trimmed.match(/Q([1-4])/i) || trimmed.match(/(?:SCIE|SCI|SSCI)[^\)]*Q([1-4])/i);
  if (qMatch) {
    pub.quartile = `Q${qMatch[1]}`;
  }
  
  // Extract volume/issue/pages
  const volMatch = trimmed.match(/Vol\.?\s*(\d+)/i);
  if (volMatch) {
    pub.volume = volMatch[1];
  }
  
  const issueMatch = trimmed.match(/(?:No\.?|Issue)\s*(\d+)/i);
  if (issueMatch) {
    pub.issue = issueMatch[1];
  }
  
  const pagesMatch = trimmed.match(/pp?\.?\s*(\d+[-–]\d+)/);
  if (pagesMatch) {
    pub.pages = pagesMatch[1];
  }
  
  // Validate title was extracted
  if (!pub.title || pub.title.length < 10) {
    warnings.push(createWarning(
      'publications',
      `Publication ${index + 1}: title unclear — please review`,
      'warning',
      index,
      trimmed.slice(0, 100)
    ));
    // Still use what we have as a fallback
    pub.title = pub.title || `Publication Entry ${index + 1}`;
  }
  
  return pub as Publication;
}

/**
 * Extracts book entries from text
 */
export function parseBooks(text: string): ParseResult<Publication[]> {
  const warnings: ParseWarning[] = [];
  const books: Publication[] = [];
  
  const entries = splitEntries(text);
  
  entries.forEach((entry, index) => {
    const trimmed = entry.trim();
    if (trimmed.length < 30) {
      return;
    }
    
    const book: MutablePublication = {
      id: generateStableId(trimmed, index),
      title: '',
      authors: null,
      journal: null,
      year: null,
      volume: null,
      issue: null,
      pages: null,
      doi: null,
      link: null,
      type: 'book',
      impactFactor: null,
      quartile: null,
      raw: trimmed,
    };
    
    // Extract year
    book.year = extractYear(trimmed);
    
    // Extract title
    const titleMatch = trimmed.match(/"([^"]+)"/) || trimmed.match(/\.([^\.]+)\..*(?:Publisher|Press|University)/i);
    if (titleMatch) {
      book.title = titleMatch[1]?.trim() ?? '';
    } else {
      book.title = trimmed.split('.')[0]?.trim() ?? `Book Entry ${index + 1}`;
    }
    
    // Extract authors
    book.authors = extractAuthors(trimmed);
    
    // Extract publisher as journal field
    const publisherMatch = trimmed.match(/(?:Publisher|Press|University Publication)[^,\.\n]*/i);
    if (publisherMatch) {
      book.journal = publisherMatch[0].trim();
    }
    
    if (!book.year) {
      warnings.push(createWarning(
        'books',
        `Book ${index + 1}: year not found`,
        'warning',
        index
      ));
    }
    
    books.push(book as Publication);
  });
  
  return { data: books, warnings };
}
