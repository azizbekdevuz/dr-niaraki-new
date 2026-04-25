/**
 * Publications parser - extracts publication entries from CV text
 * Conservative extraction with warnings for ambiguous fields
 */

import type { MutablePublication, Publication } from '@/types/details';
import type { ParseWarning, ParseResult } from '@/types/parser';

import {
  createWarning,
  extractAuthors,
  extractYear,
  generateStableId,
  splitEntries,
} from './parserUtils';
import { parsePublicationEntry } from './publicationEntryParser';
import { splitPublicationApaBlocks } from './publicationsParserApa';

/**
 * Parses publications section text into structured data
 */
export function parsePublications(text: string): ParseResult<Publication[]> {
  const warnings: ParseWarning[] = [];
  const publications: Publication[] = [];

  const cleanedText = text
    .replace(/^(?:JOURNAL PAPERS|BOOKS|BOOK CHAPTERS|CONFERENCE PAPERS|CONFERENCES)[\s:]*\n/gi, '')
    .replace(/\n(?:JOURNAL PAPERS|BOOKS|BOOK CHAPTERS|CONFERENCE PAPERS|CONFERENCES)[\s:]*\n/gi, '\n')
    .trim();

  const apa = splitPublicationApaBlocks(cleanedText);
  const legacy = splitEntries(cleanedText);
  const keys = new Set(apa.map((s) => s.slice(0, 96).replace(/\s+/g, ' ')));
  for (const e of legacy) {
    if (e.length < 55) {
      continue;
    }
    const k = e.slice(0, 96).replace(/\s+/g, ' ');
    if (!keys.has(k)) {
      keys.add(k);
      apa.push(e);
    }
  }
  const entries = apa.length > 0 ? apa : legacy;

  let finalEntries = entries;
  if (entries.length === 0 || entries.length === 1) {
    const lines = cleanedText.split('\n').filter((l) => l.trim().length > 20);
    const potentialEntries: string[] = [];
    let currentEntry = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      const prevLine = i > 0 ? lines[i - 1]?.trim() : '';
      const looksLikeNewEntry =
        /^\d+[\.\)]\s/.test(line) ||
        /^[•·\-\*]\s/.test(line) ||
        (line.length > 50 && /^[A-Z]/.test(line) && i > 0 && prevLine && prevLine.length > 50);

      if (looksLikeNewEntry && currentEntry.length > 50) {
        potentialEntries.push(currentEntry.trim());
        currentEntry = line;
      } else {
        currentEntry += (currentEntry ? '\n' : '') + line;
      }
    }

    if (currentEntry.trim().length > 50) {
      potentialEntries.push(currentEntry.trim());
    }

    if (potentialEntries.length > entries.length) {
      finalEntries = potentialEntries;
    }
  }

  if (finalEntries.length === 0) {
    warnings.push(createWarning('publications', 'No publication entries detected in text', 'info'));
    return { data: [], warnings };
  }

  finalEntries.forEach((entry, index) => {
    const publication = parsePublicationEntry(entry, index, warnings);
    if (publication) {
      publications.push(publication);
    }
  });

  return { data: publications, warnings };
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

    book.year = extractYear(trimmed);

    const titleMatch =
      trimmed.match(/"([^"]+)"/) || trimmed.match(/\.([^\.]+)\..*(?:Publisher|Press|University)/i);
    if (titleMatch) {
      book.title = titleMatch[1]?.trim() ?? '';
    } else {
      book.title = trimmed.split('.')[0]?.trim() ?? `Book Entry ${index + 1}`;
    }

    book.authors = extractAuthors(trimmed);

    const publisherMatch = trimmed.match(/(?:Publisher|Press|University Publication)[^,\.\n]*/i);
    if (publisherMatch) {
      book.journal = publisherMatch[0].trim();
    }

    if (!book.year) {
      warnings.push(createWarning('books', `Book ${index + 1}: year not found`, 'warning', index));
    }

    books.push(book as Publication);
  });

  return { data: books, warnings };
}
