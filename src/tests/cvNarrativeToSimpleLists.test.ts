import { describe, expect, it } from 'vitest';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent } from '@/content/validators';
import {
  CV_NARRATIVE_LIST_ITEM_PREFIX,
  mergeSiteSimpleListWithCvNarratives,
  narrativeSectionToSimpleListItem,
} from '@/server/imports/cvNarrativeToSimpleLists';
import { mergeCvDetailsIntoSiteContent } from '@/server/imports/detailsToSiteContentMerge';
import type { CvNarrativeSection } from '@/types/details';
import type { DetailsSchemaType } from '@/validators/detailsSchema';

function minimalDetailsWithNarratives(sections: CvNarrativeSection[]): DetailsSchemaType {
  return {
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
      cvNarrativeSections: sections,
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
}

describe('cvNarrativeToSimpleLists', () => {
  it('maps narrative kinds to the correct site lists with cv-nar ids', () => {
    const narratives: CvNarrativeSection[] = [
      {
        id: 'nar-teach-1',
        kind: 'teaching',
        sectionTitle: 'Teaching Experiences',
        body: 'Course A and B.',
        sourceSectionType: 'services',
      },
      {
        id: 'nar-lead-1',
        kind: 'leadership_supervision',
        sectionTitle: 'Academic Leadership and Supervision',
        body: 'Supervised N students.',
        sourceSectionType: 'academic_narrative',
      },
      {
        id: 'nar-svc-1',
        kind: 'professional_services',
        sectionTitle: 'Professional Services',
        body: 'Committee work.',
        sourceSectionType: 'services',
      },
      {
        id: 'nar-other',
        kind: 'other',
        sectionTitle: 'Misc',
        body: 'Should not merge.',
        sourceSectionType: 'services',
      },
    ];
    const teaching = mergeSiteSimpleListWithCvNarratives([], narratives, 'teaching');
    const supervision = mergeSiteSimpleListWithCvNarratives([], narratives, 'supervision');
    const service = mergeSiteSimpleListWithCvNarratives([], narratives, 'service');

    expect(teaching).toHaveLength(1);
    expect(teaching[0]?.id).toBe(`${CV_NARRATIVE_LIST_ITEM_PREFIX}nar-teach-1`);
    expect(supervision).toHaveLength(1);
    expect(service).toHaveLength(1);
    expect(service[0]?.title).toContain('Professional Services');
  });

  it('preserves curated rows and replaces only cv-nar rows on re-merge', () => {
    const base = [
      { id: 'curated-1', title: 'Curated teaching', body: 'Keep me' },
      { id: `${CV_NARRATIVE_LIST_ITEM_PREFIX}old`, title: 'Old import', body: 'gone' },
    ];
    const narratives: CvNarrativeSection[] = [
      {
        id: 'new-1',
        kind: 'teaching',
        sectionTitle: 'Fresh',
        body: 'New body',
        sourceSectionType: 'services',
      },
    ];
    const next = mergeSiteSimpleListWithCvNarratives(base, narratives, 'teaching');
    expect(next.map((r) => r.id)).toEqual(['curated-1', `${CV_NARRATIVE_LIST_ITEM_PREFIX}new-1`]);
    expect(next[1]?.body).toContain('New body');
  });

  it('mergeCvDetailsIntoSiteContent wires narratives into SiteContent', () => {
    const base = assertSiteContent(SITE_CONTENT_RAW);
    const details = minimalDetailsWithNarratives([
      {
        id: 't1',
        kind: 'teaching',
        sectionTitle: 'Teaching',
        body: 'Merged teaching narrative.',
        sourceSectionType: 'services',
      },
    ]);
    const merged = mergeCvDetailsIntoSiteContent(details, base);
    const row = merged.teaching.find((t) => t.id.startsWith(CV_NARRATIVE_LIST_ITEM_PREFIX));
    expect(row?.body).toContain('Merged teaching narrative');
  });

  it('narrativeSectionToSimpleListItem returns null for empty body', () => {
    expect(
      narrativeSectionToSimpleListItem({
        id: 'x',
        kind: 'teaching',
        sectionTitle: 'T',
        body: '   ',
        sourceSectionType: 'services',
      }),
    ).toBeNull();
  });
});
