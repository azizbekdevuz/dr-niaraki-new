/**
 * Conservative capture of long-form CV sections (teaching, service, workshops, etc.).
 * Section `kind` is derived from anchored headers only; body text is preserved as-is.
 */

import type { CvNarrativeKind, CvNarrativeSection } from '@/types/details';
import type { DetectedSection } from '@/types/parser';

import { generateStableId } from './parserUtils';

const DEFAULT_BODY_CAP = 120_000;

export function clampNarrativeBody(body: string, maxChars = DEFAULT_BODY_CAP): string {
  const t = body.trim();
  if (t.length <= maxChars) {
    return t;
  }
  return `${t.slice(0, maxChars)}\n\n[Truncated at ${maxChars} characters during parse.]`;
}

export function classifyCvNarrativeKind(section: Pick<DetectedSection, 'type' | 'title'>): CvNarrativeKind {
  const title = section.title.trim();
  const tl = title.toLowerCase();

  if (section.type === 'academic_narrative') {
    return 'leadership_supervision';
  }
  if (section.type === 'workshops') {
    return 'workshops_exhibitions';
  }
  if (section.type === 'skills') {
    return 'skills';
  }
  if (section.type === 'services') {
    if (/journal\s+and\s+conference\s+reviews?\b/i.test(tl)) {
      return 'editorial_reviews';
    }
    if (/^teaching\s+experiences?\b/i.test(tl)) {
      return 'teaching';
    }
    if (/^professional\s+services?\b/i.test(tl)) {
      return 'professional_services';
    }
    return 'other';
  }
  return 'other';
}

export function buildCvNarrativeSection(section: DetectedSection, index: number): CvNarrativeSection | null {
  const body = clampNarrativeBody(section.content);
  if (body.length === 0) {
    return null;
  }
  return {
    id: generateStableId(`${section.type}:${section.title}`, index),
    kind: classifyCvNarrativeKind(section),
    sectionTitle: section.title.trim(),
    body,
    sourceSectionType: section.type,
  };
}

export function shouldCaptureAsNarrative(sectionType: DetectedSection['type']): boolean {
  return (
    sectionType === 'services' ||
    sectionType === 'workshops' ||
    sectionType === 'skills' ||
    sectionType === 'academic_narrative'
  );
}

/** Mutates `bucket` and `nextIndex` when a narrative capture applies. */
export function appendNarrativeFromDetectedSection(
  section: DetectedSection,
  bucket: CvNarrativeSection[],
  nextIndex: { value: number },
): void {
  if (!shouldCaptureAsNarrative(section.type)) {
    return;
  }
  const narrative = buildCvNarrativeSection(section, nextIndex.value);
  nextIndex.value += 1;
  if (narrative) {
    bucket.push(narrative);
  }
}
