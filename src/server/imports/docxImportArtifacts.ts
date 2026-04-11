/**
 * Pure helpers for DOCX → import-domain persistence (no I/O).
 * Kept separate from `server-only` orchestration so Vitest can import them without mocks.
 */

import type { ImportStatus } from '@prisma/client';

import type { ImportWarningItem } from '@/server/imports/types';
import type { Details } from '@/types/details';
import type { ParseWarning } from '@/types/parser';

type ZodLikeIssue = { readonly path: ReadonlyArray<PropertyKey>; readonly message: string };

export type DocxRawExtractEnvelopeV1 = {
  kind: 'docx-details-v1';
  parserVersion: string;
  sourceFileName: string;
  parsedAt: string;
  uploaderLabel: string | null;
  counts: {
    publications: number;
    patents: number;
    awards: number;
    projects: number;
  };
  validation: { success: boolean; errors: string[] };
  parseWarningCount: number;
  parserErrorCount: number;
};

export function parseWarningsToImportItems(warnings: readonly ParseWarning[]): ImportWarningItem[] {
  return warnings.map((w) => ({
    code: w.field,
    path: w.index !== undefined ? `${w.field}[${w.index}]` : w.field,
    message: `[${w.severity}] ${w.message}`,
  }));
}

export function zodIssuesToImportItems(issues: readonly ZodLikeIssue[] | undefined): ImportWarningItem[] {
  if (!issues?.length) {
    return [];
  }
  return issues.map((issue) => ({
    code: 'VALIDATION',
    path: issue.path.length ? issue.path.map(String).join('.') : undefined,
    message: issue.message,
  }));
}

export function heuristicImportWarnings(details: Details): ImportWarningItem[] {
  const out: ImportWarningItem[] = [];
  if (details.publications.length === 0) {
    out.push({
      code: 'EMPTY_PUBLICATIONS',
      message: 'Parser produced zero publications — verify the CV section headings and parsing rules.',
    });
  }
  const email = details.contact.email?.trim();
  if (!email) {
    out.push({
      code: 'MISSING_CONTACT_EMAIL',
      message: 'Official contact email is missing after parse — check the contact block in the DOCX.',
    });
  }
  return out;
}

export function mergeImportWarningLists(...lists: readonly ImportWarningItem[][]): ImportWarningItem[] {
  const merged: ImportWarningItem[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const item of list) {
      const key = `${item.code ?? ''}|${item.path ?? ''}|${item.message}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export function buildDocxRawExtractEnvelope(input: {
  parserVersion: string;
  sourceFileName: string;
  parsedAt: string;
  uploaderLabel: string | null;
  details: Details;
  validationSuccess: boolean;
  validationErrors: string[];
  parseWarnings: readonly ParseWarning[];
}): DocxRawExtractEnvelopeV1 {
  const parserErrorCount = input.parseWarnings.filter((w) => w.severity === 'error').length;
  return {
    kind: 'docx-details-v1',
    parserVersion: input.parserVersion,
    sourceFileName: input.sourceFileName,
    parsedAt: input.parsedAt,
    uploaderLabel: input.uploaderLabel,
    counts: {
      publications: input.details.publications.length,
      patents: input.details.patents.length,
      awards: input.details.about.awards.length,
      projects: input.details.research.projects.length,
    },
    validation: {
      success: input.validationSuccess,
      errors: input.validationErrors,
    },
    parseWarningCount: input.parseWarnings.length,
    parserErrorCount,
  };
}

/** Serialize Details (and nested read-only arrays) for Prisma JSON columns. */
export function detailsForJson(details: Details): unknown {
  return JSON.parse(JSON.stringify(details)) as unknown;
}

const RAW_HTML_STORE_MAX = 24_000;

/**
 * Shapes `Details` for Prisma JSON storage: drops mammoth HTML bulk while keeping a reviewable candidate.
 * Full HTML remains available on the immediate upload API response only (not re-fetched from DB).
 */
export function detailsCandidateForImportStorage(details: Details): Record<string, unknown> {
  const o = JSON.parse(JSON.stringify(details)) as Record<string, unknown>;
  const raw = o.rawHtml;
  if (typeof raw === 'string' && raw.length > RAW_HTML_STORE_MAX) {
    o.rawHtml = raw.slice(0, RAW_HTML_STORE_MAX);
    o.rawHtmlTruncated = true;
    o.rawHtmlOriginalLength = raw.length;
  }
  return o;
}

export function resolveImportStatusAfterParse(input: {
  validationSuccess: boolean;
  parseWarnings: readonly ParseWarning[];
}): ImportStatus {
  const hasParserError = input.parseWarnings.some((w) => w.severity === 'error');
  if (!input.validationSuccess || hasParserError) {
    return 'NEEDS_REVIEW';
  }
  return 'PARSED';
}
