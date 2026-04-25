/**
 * Core metadata + title heuristics for a single publication citation block.
 */

import type { MutablePublication } from '@/types/details';
import type { ParseWarning } from '@/types/parser';

import {
  createWarning,
  determinePublicationType,
  extractAuthors,
  extractDoi,
  extractJournalName,
  extractYear,
} from './parserUtils';
import { applyPublicationVolumeIssuePages } from './publicationEntryMetadata';

export function applyPublicationCoreMetadata(
  trimmed: string,
  pub: MutablePublication,
  index: number,
  warnings: ParseWarning[],
): void {
  const year = extractYear(trimmed);
  if (year) {
    pub.year = year;
  } else {
    warnings.push(
      createWarning(
        'publications',
        `Publication ${index + 1}: year not found — please review`,
        'warning',
        index,
        trimmed.slice(0, 100),
      ),
    );
  }

  const doi = extractDoi(trimmed);
  if (doi) {
    pub.doi = doi;
    pub.link = `https://doi.org/${doi}`;
  }

  const authors = extractAuthors(trimmed);
  if (authors) {
    pub.authors = authors;
  }

  const journal = extractJournalName(trimmed);
  if (journal) {
    pub.journal = journal;
  }

  pub.type = determinePublicationType(trimmed);
}

export function fillPublicationTitleFromCitation(trimmed: string, pub: MutablePublication): void {
  const quoted = trimmed.match(/"([^"]{8,})"/);
  if (quoted?.[1]) {
    pub.title = quoted[1].trim();
    return;
  }

  const apaBody = trimmed.match(/^[^(]+?\(\d{4}\)\.\s*(.+)$/);
  if (apaBody?.[1]) {
    const body = apaBody[1].trim();
    const journalBreak = body.search(
      /\.\s+[A-Z](?:[a-z]+(?:\s+[a-z]+){0,10})\s*(?:\(?SCIE|\(?SSCI|,?\s*\d{1,2}\(\d)/i,
    );
    if (journalBreak > 25) {
      pub.title = body.slice(0, journalBreak + 1).trim();
    } else {
      pub.title = body.split(/\(\s*SCIE/i)[0]?.trim() ?? body.slice(0, 400).trim();
    }
    if (!pub.journal) {
      const jm = body.match(/\.\s*([A-Z][A-Za-z&\s,.-]{6,90}?)\s*\(?SCIE/i);
      if (jm?.[1]) {
        pub.journal = jm[1].replace(/^\.\s*/, '').trim();
      }
    }
    return;
  }

  const titleEnd = trimmed.search(/\.\s*(?:\(?\d{4}|\w+\s+Journal|Vol)/i);
  if (titleEnd > 0) {
    pub.title = trimmed.slice(0, titleEnd).trim();
    return;
  }

  const firstLine = trimmed.split('\n')[0];
  pub.title =
    firstLine && firstLine.length > 200 ? `${firstLine.slice(0, 200)}...` : (firstLine ?? '').trim();
}

export function finalizePublicationEntry(
  trimmed: string,
  pub: MutablePublication,
  index: number,
  warnings: ParseWarning[],
): void {
  fillPublicationTitleFromCitation(trimmed, pub);
  applyPublicationVolumeIssuePages(trimmed, pub);
  if (!pub.title || pub.title.length < 10) {
    warnings.push(
      createWarning(
        'publications',
        `Publication ${index + 1}: title unclear — please review`,
        'warning',
        index,
        trimmed.slice(0, 100),
      ),
    );
    pub.title = pub.title || `Publication Entry ${index + 1}`;
  }
}
