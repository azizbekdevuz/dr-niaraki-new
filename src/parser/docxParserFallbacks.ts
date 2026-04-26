/**
 * Full-text fallbacks when section splitting misses publications or patents.
 */

import type { Patent, Publication } from '@/types/details';
import type { ParseWarning } from '@/types/parser';

import { createWarning } from './parserUtils';
import { parsePatents } from './patentsParser';
import { parsePublications } from './publicationsParser';

const PUB_PATTERNS: RegExp[] = [
  /JOURNAL PAPERS[\s\S]*?(?=\n(?:CONFERENCE|PATENTS|BOOKS|AWARDS|SKILLS|TEACHING|WORKSHOP|SERVICE)[\s\S]*?$)/i,
  /JOURNAL PAPERS[\s\S]*?(?=\n{3,}[A-Z]{3,})/i,
  /JOURNAL PAPERS[\s\S]*?(?=\n[A-Z]{2,}[\s]*\n)/i,
  /JOURNAL PAPERS[\s\S]*?$/i,
  /PUBLICATIONS[\s\S]*?(?=\n(?:PATENTS|AWARDS|SKILLS|TEACHING)[\s\S]*?$)/i,
  /PUBLICATIONS[\s\S]*?$/i,
];

const PAT_PATTERNS: RegExp[] = [
  /PATENTS[\s\S]*?(?=\n(?:PUBLICATIONS|AWARDS|SKILLS|TEACHING|WORKSHOP)[\s\S]*?$)/i,
  /PATENTS[\s\S]*?(?=\n{3,}[A-Z]{3,})/i,
  /PATENTS[\s\S]*?(?=\n[A-Z]{2,}[\s]*\n)/i,
  /PATENTS[\s\S]*?$/i,
  /(?:REGISTERED|COMPLETED)[\s]*PATENTS?[\s\S]*?(?=\n(?:PUBLICATIONS|AWARDS)[\s\S]*?$)/i,
];

export function tryFallbackPublicationsFromFullText(
  fullText: string,
  warnings: ParseWarning[],
): Publication[] {
  for (const pattern of PUB_PATTERNS) {
    const pubMatch = fullText.match(pattern);
    if (pubMatch && pubMatch[0].length > 100) {
      const pubResult = parsePublications(pubMatch[0]);
      if (pubResult.data.length > 0) {
        warnings.push(...pubResult.warnings);
        return pubResult.data;
      }
    }
  }
  warnings.push(createWarning('publications', 'No publications section found', 'info'));
  return [];
}

export function tryFallbackPatentsFromFullText(fullText: string, warnings: ParseWarning[]): Patent[] {
  for (const pattern of PAT_PATTERNS) {
    const patMatch = fullText.match(pattern);
    if (patMatch && patMatch[0].length > 50) {
      const patResult = parsePatents(patMatch[0]);
      if (patResult.data.length > 0) {
        warnings.push(...patResult.warnings);
        return patResult.data;
      }
    }
  }
  return [];
}
