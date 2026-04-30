import type { AboutAwardItem, AboutJourneyItem, SimpleListItem } from '@/content/schema';
import type { ExperienceEditorRow } from '@/lib/draftEditorSlice';

export const careerFieldClass =
  'w-full px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm';

export function newStableId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}`;
}

export function defaultJourney(): AboutJourneyItem {
  return {
    id: newStableId(),
    title: 'New qualification or role',
    institution: 'Institution',
    year: 'Year or period',
    details: 'Short description',
  };
}

export function defaultExperience(): ExperienceEditorRow {
  return {
    id: newStableId(),
    position: 'Position title',
    institution: 'Organization',
    duration: 'Start – End',
    details: 'Role description',
    achievementsText: '',
    projects: [],
    type: 'academic',
  };
}

/** @returns false if user cancels */
export function confirmRemoveLastListItem(sectionTitle: string): boolean {
  return window.confirm(
    `Remove the last ${sectionTitle}? At least one entry is required to save — add another before saving.`,
  );
}

export function defaultAward(): AboutAwardItem {
  return {
    id: newStableId(),
    title: 'Award or honor',
    organization: 'Organization',
    year: 'Year',
    details: 'Description shown on the public About page',
    impact: 'Additional context (not always shown)',
    category: 'research',
  };
}

export function defaultSimpleListItem(): SimpleListItem {
  return {
    id: newStableId(),
    title: 'Section or list heading',
    body: 'Optional body text (shown when the public page renders this list).',
  };
}
