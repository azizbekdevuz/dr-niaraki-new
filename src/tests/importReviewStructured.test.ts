import { describe, expect, it } from 'vitest';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent } from '@/content/validators';
import { mergeCvDetailsIntoSiteContent } from '@/server/imports/detailsToSiteContentMerge';
import { buildStructuredReviewBlocks } from '@/server/imports/importReviewStructured';
import type { DetailsSchemaType } from '@/validators/detailsSchema';

function minimalDetails(overrides: Partial<DetailsSchemaType> = {}): DetailsSchemaType {
  const base: DetailsSchemaType = {
    profile: {
      name: 'Dr X',
      title: 'Prof',
      photoUrl: null,
      summary: null,
      meta: null,
    },
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
    contact: {
      email: 'x@y.com',
      personalEmail: null,
      phone: null,
      fax: null,
      cellPhone: null,
      address: null,
      department: null,
      university: null,
      website: null,
      cvUrl: null,
      social: {},
    },
    rawHtml: null,
    counts: {
      publications: 0,
      patents: 0,
      projects: 0,
      awards: 0,
      students: 0,
    },
    meta: {
      sourceFileName: 'f.docx',
      parsedAt: '2026-01-01T00:00:00.000Z',
      parserVersion: 't',
      commitSha: null,
      uploader: null,
      warnings: [],
    },
  };
  return { ...base, ...overrides };
}

describe('buildStructuredReviewBlocks', () => {
  it('includes list diff entries for new publication ids', () => {
    const baseline = assertSiteContent(SITE_CONTENT_RAW);
    const details = minimalDetails({
      publications: [
        {
          id: 'newpub',
          title: 'Only Import',
          authors: 'Me',
          journal: 'J',
          year: 2025,
          volume: null,
          issue: null,
          pages: null,
          doi: null,
          link: null,
          type: 'journal',
          impactFactor: null,
          quartile: null,
          raw: null,
        },
      ],
      counts: { publications: 1, patents: 0, projects: 0, awards: 0, students: 0 },
    });
    const merged = mergeCvDetailsIntoSiteContent(details, baseline);
    const blocks = buildStructuredReviewBlocks(baseline, merged, {
      importId: 'imp1',
      originalFileName: 'f.docx',
      storedPath: '/uploads/f.docx',
      uploadedFileId: 'uf1',
    });
    const pub = blocks.find((b) => b.id === 'publications');
    expect(pub?.added.some((l) => l.includes('newpub'))).toBe(true);
  });

  it('surfaces profile scalar changes when baseline and merged differ', () => {
    const baseline = assertSiteContent(SITE_CONTENT_RAW);
    const merged = structuredClone(baseline);
    merged.profile.displayName = 'Renamed For Review';
    const blocks = buildStructuredReviewBlocks(baseline, merged, {
      importId: 'imp2',
      originalFileName: 'g.docx',
      storedPath: '/uploads/g.docx',
      uploadedFileId: 'uf2',
    });
    const profile = blocks.find((b) => b.id === 'profile');
    expect(profile?.changed.length).toBeGreaterThan(0);
    expect(profile?.changed.some((c) => c.lines.some((l) => l.includes('displayName')))).toBe(true);
  });
});
