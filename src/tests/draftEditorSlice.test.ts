import { describe, it, expect } from 'vitest';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent } from '@/content/validators';
import {
  extractEditorSliceFromSiteContent,
  mergeEditorSliceIntoSiteContent,
  moveIndexInArray,
  professionalSummaryParagraphsToText,
  textToProfessionalSummaryParagraphs,
  validateEditorSliceClient,
} from '@/lib/draftEditorSlice';

describe('draftEditorSlice', () => {
  const base = assertSiteContent(SITE_CONTENT_RAW);

  it('round-trips professional summary paragraphs through text', () => {
    const text = professionalSummaryParagraphsToText(base.about.page.professionalSummaryParagraphs);
    const back = textToProfessionalSummaryParagraphs(text);
    expect(back).toEqual(base.about.page.professionalSummaryParagraphs);
  });

  it('mergeEditorSliceIntoSiteContent updates only the narrow slice', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    slice.profile.displayName = 'Test Name';
    slice.contact.email = 't@sejong.ac.kr';
    const merged = mergeEditorSliceIntoSiteContent(base, slice);
    expect(merged.profile.displayName).toBe('Test Name');
    expect(merged.contact.info.email).toBe('t@sejong.ac.kr');
    expect(merged.publications.items.length).toBe(base.publications.items.length);
  });

  it('extract includes journey, experiences, and awards', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    expect(slice.journey.length).toBe(base.about.journey.length);
    expect(slice.experiences.length).toBe(base.about.experiences.length);
    expect(slice.awards.length).toBe(base.about.awards.length);
  });

  it('merge updates journey and preserves about.stats', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    if (slice.journey.length === 0) {
      return;
    }
    slice.journey[0] = { ...slice.journey[0]!, title: 'Edited title' };
    const merged = mergeEditorSliceIntoSiteContent(base, slice);
    expect(merged.about.journey[0]?.title).toBe('Edited title');
    expect(merged.about.stats).toEqual(base.about.stats);
  });

  it('moveIndexInArray swaps neighbors', () => {
    expect(moveIndexInArray(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveIndexInArray(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
  });

  it('validateEditorSliceClient rejects empty display name', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    slice.profile.displayName = '   ';
    const r = validateEditorSliceClient(slice);
    expect(r.ok).toBe(false);
  });

  it('validateEditorSliceClient rejects journey item with empty title', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    slice.journey = [{ id: 'x', title: '', institution: 'i', year: 'y', details: 'd' }];
    const r = validateEditorSliceClient(slice);
    expect(r.ok).toBe(false);
  });

  it('validateEditorSliceClient rejects empty journey, experiences, or awards lists', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    slice.journey = [];
    expect(validateEditorSliceClient(slice).ok).toBe(false);
    const slice2 = extractEditorSliceFromSiteContent(base);
    slice2.experiences = [];
    expect(validateEditorSliceClient(slice2).ok).toBe(false);
    const slice3 = extractEditorSliceFromSiteContent(base);
    slice3.awards = [];
    expect(validateEditorSliceClient(slice3).ok).toBe(false);
  });

  it('mergeEditorSliceIntoSiteContent preserves experience projects when achievements change', () => {
    const slice = extractEditorSliceFromSiteContent(base);
    if (slice.experiences.length === 0) {
      return;
    }
    const first = slice.experiences[0]!;
    first.projects = ['Keep this project line'];
    first.achievementsText = 'Only achievements edited\nSecond line';
    const merged = mergeEditorSliceIntoSiteContent(base, slice);
    expect(merged.about.experiences[0]?.projects).toEqual(['Keep this project line']);
    expect(merged.about.experiences[0]?.achievements).toEqual(['Only achievements edited', 'Second line']);
  });
});
