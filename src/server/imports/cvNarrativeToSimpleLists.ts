/**
 * Maps CV narrative sections (conservative parser output) into public `SiteContent`
 * `teaching` / `supervision` / `service` simple lists.
 *
 * Policy:
 * - Items merged from CV use ids prefixed with `cv-nar-` so re-import can replace them without touching curated rows.
 * - `other` narrative kind is never auto-merged (remains details-only archival).
 */

import type { SimpleListItem, SiteContent } from '@/content/schema';
import type { CvNarrativeKind, CvNarrativeSection } from '@/types/details';

export const CV_NARRATIVE_LIST_ITEM_PREFIX = 'cv-nar-';

function narrativeKindsForSiteList(
  list: 'teaching' | 'supervision' | 'service',
): readonly CvNarrativeKind[] {
  if (list === 'teaching') {
    return ['teaching'] as const;
  }
  if (list === 'supervision') {
    return ['leadership_supervision'] as const;
  }
  return ['professional_services', 'editorial_reviews', 'workshops_exhibitions', 'skills'] as const;
}

export function narrativeSectionToSimpleListItem(section: CvNarrativeSection): SimpleListItem | null {
  const title = section.sectionTitle.trim().slice(0, 280) || 'CV section';
  const body = section.body.trim();
  if (!body) {
    return null;
  }
  return {
    id: `${CV_NARRATIVE_LIST_ITEM_PREFIX}${section.id}`,
    title,
    body,
  };
}

/** Keeps curated rows; drops prior CV-derived rows; appends fresh rows from the current import. */
export function mergeSiteSimpleListWithCvNarratives(
  baseList: readonly SimpleListItem[],
  narratives: readonly CvNarrativeSection[] | undefined,
  list: 'teaching' | 'supervision' | 'service',
): SimpleListItem[] {
  const kept = baseList.filter((row) => !row.id.startsWith(CV_NARRATIVE_LIST_ITEM_PREFIX));
  const kinds = narrativeKindsForSiteList(list);
  const sections = (narratives ?? []).filter((s) => kinds.includes(s.kind));
  const additions: SimpleListItem[] = [];
  for (const s of sections) {
    const item = narrativeSectionToSimpleListItem(s);
    if (item) {
      additions.push(item);
    }
  }
  return [...kept, ...additions];
}

export function applyCvNarrativeSectionsToSiteContent(
  detailsAbout: { cvNarrativeSections?: readonly CvNarrativeSection[] },
  next: SiteContent,
): void {
  const narratives = detailsAbout.cvNarrativeSections;
  next.teaching = mergeSiteSimpleListWithCvNarratives(next.teaching, narratives, 'teaching');
  next.supervision = mergeSiteSimpleListWithCvNarratives(next.supervision, narratives, 'supervision');
  next.service = mergeSiteSimpleListWithCvNarratives(next.service, narratives, 'service');
}
