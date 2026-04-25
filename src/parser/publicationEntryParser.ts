/**
 * Parses a single publication citation block into a `Publication` row.
 */

import type { Publication, MutablePublication } from '@/types/details';
import type { ParseWarning } from '@/types/parser';

import { generateStableId } from './parserUtils';
import { applyPublicationCoreMetadata, finalizePublicationEntry } from './publicationEntryCore';

export function parsePublicationEntry(
  text: string,
  index: number,
  warnings: ParseWarning[],
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

  applyPublicationCoreMetadata(trimmed, pub, index, warnings);
  finalizePublicationEntry(trimmed, pub, index, warnings);

  return pub as Publication;
}
