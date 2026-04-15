import { describe, it, expect } from 'vitest';

import {
  buildDocxRawExtractEnvelope,
  detailsCandidateForImportStorage,
  heuristicImportWarnings,
  mergeImportWarningLists,
  parseWarningsToImportItems,
  resolveImportStatusAfterParse,
  zodIssuesToImportItems,
} from '@/server/imports/docxImportArtifacts';
import type { Details } from '@/types/details';
import type { ParseWarning } from '@/types/parser';

function minimalDetails(overrides: Partial<Details> = {}): Details {
  const base: Details = {
    profile: { name: 'Test', title: null, photoUrl: null, summary: null, meta: null },
    about: {
      brief: null,
      full: null,
      education: [],
      positions: [],
      awards: [],
      languages: [],
    },
    research: { interests: [], projects: [], grants: [] },
    publications: [],
    patents: [],
    contact: { email: 'a@b.c', personalEmail: null, phone: null, fax: null, cellPhone: null, address: null, department: null, university: null, website: null, cvUrl: null, social: {} },
    rawHtml: null,
    counts: { publications: 0, patents: 0, projects: 0, awards: 0, students: 0 },
    meta: {
      sourceFileName: 'f.docx',
      parsedAt: '2026-01-01T00:00:00.000Z',
      parserVersion: 'v1',
      commitSha: null,
      uploader: null,
      warnings: [],
    },
  };
  return { ...base, ...overrides };
}

describe('docxImportArtifacts', () => {
  it('parseWarningsToImportItems maps severity into message', () => {
    const w: ParseWarning[] = [
      { field: 'contact', message: 'x', severity: 'warning' },
      { field: 'pub', index: 2, message: 'bad', severity: 'error' },
    ];
    const items = parseWarningsToImportItems(w);
    expect(items[0]?.message).toContain('[warning]');
    expect(items[1]?.path).toBe('pub[2]');
  });

  it('zodIssuesToImportItems maps paths', () => {
    expect(
      zodIssuesToImportItems([{ path: ['publications', 0, 'title'], message: 'Required' }]),
    ).toEqual([{ code: 'VALIDATION', path: 'publications.0.title', message: 'Required' }]);
  });

  it('heuristicImportWarnings flags empty publications and missing email', () => {
    const d = minimalDetails({ publications: [], contact: { ...minimalDetails().contact, email: null } });
    const h = heuristicImportWarnings(d);
    expect(h.some((x) => x.code === 'EMPTY_PUBLICATIONS')).toBe(true);
    expect(h.some((x) => x.code === 'MISSING_CONTACT_EMAIL')).toBe(true);
  });

  it('mergeImportWarningLists dedupes by code+path+message', () => {
    const a = [{ message: 'm', code: 'c' }];
    const b = [{ message: 'm', code: 'c' }, { message: 'other' }];
    expect(mergeImportWarningLists(a, b)).toHaveLength(2);
  });

  it('resolveImportStatusAfterParse uses NEEDS_REVIEW when validation fails or parser has errors', () => {
    expect(
      resolveImportStatusAfterParse({
        validationSuccess: true,
        parseWarnings: [],
      }),
    ).toBe('PARSED');
    expect(
      resolveImportStatusAfterParse({
        validationSuccess: false,
        parseWarnings: [],
      }),
    ).toBe('NEEDS_REVIEW');
    expect(
      resolveImportStatusAfterParse({
        validationSuccess: true,
        parseWarnings: [{ field: 'x', message: 'm', severity: 'error' }],
      }),
    ).toBe('NEEDS_REVIEW');
  });

  it('detailsCandidateForImportStorage truncates very large rawHtml', () => {
    const details = minimalDetails();
    const huge = 'x'.repeat(30_000);
    const stored = detailsCandidateForImportStorage({ ...details, rawHtml: huge } as Details);
    expect(stored.rawHtmlTruncated).toBe(true);
    expect(typeof stored.rawHtml === 'string' && (stored.rawHtml as string).length).toBeLessThanOrEqual(24_000);
  });

  it('buildDocxRawExtractEnvelope captures counts and validation snapshot', () => {
    const details = minimalDetails({
      publications: [
        {
          id: '1',
          title: 'T',
          authors: null,
          journal: null,
          year: null,
          type: 'journal',
          raw: null,
        },
      ],
    });
    const env = buildDocxRawExtractEnvelope({
      parserVersion: 'v9',
      sourceFileName: 'cv.docx',
      parsedAt: '2026-01-02T00:00:00.000Z',
      uploaderLabel: 'admin',
      details,
      validationSuccess: false,
      validationErrors: ['profile.name: too short'],
      parseWarnings: [],
    });
    expect(env.kind).toBe('docx-details-v1');
    expect(env.counts.publications).toBe(1);
    expect(env.validation.success).toBe(false);
    expect(env.validation.errors).toEqual(['profile.name: too short']);
  });
});
