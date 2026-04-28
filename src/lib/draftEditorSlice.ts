/**
 * Draft-editing slice: profile, summary, contact, about journey, experiences, awards.
 * Merges into a full SiteContent clone; server validation remains authoritative.
 */

import type {
  AboutAwardItem,
  AboutJourneyItem,
  AboutExperienceItem,
  SimpleListItem,
  SiteContent,
} from '@/content/schema';

/**
 * Experience row in the editor.
 * `projects` are preserved from the server but not edited here (not shown on the public About page).
 */
export type ExperienceEditorRow = {
  id: string;
  position: string;
  institution: string;
  duration: string;
  details: string;
  achievementsText: string;
  /** Carried through merge unchanged — UI does not expose project lines until they are surfaced publicly. */
  projects: string[];
  type: AboutExperienceItem['type'];
};

export type DraftEditorSlice = {
  profile: {
    displayName: string;
    roleLine: string;
    homeAboutIntro: string;
    aboutIntroTagline: string;
  };
  aboutProfessionalSummaryText: string;
  contact: {
    email: string;
    personalEmail: string;
    websiteDisplay: string;
  };
  journey: AboutJourneyItem[];
  experiences: ExperienceEditorRow[];
  awards: AboutAwardItem[];
  /** Teaching / supervision / service simple lists (also receive CV narrative merge rows with `cv-nar-` ids). */
  teaching: SimpleListItem[];
  supervision: SimpleListItem[];
  service: SimpleListItem[];
};

export function professionalSummaryParagraphsToText(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

/** Split on blank lines; require at least one non-empty paragraph for a valid save. */
export function textToProfessionalSummaryParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

export function linesToStringArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function moveIndexInArray<T>(items: T[], index: number, delta: -1 | 1): T[] {
  const next = [...items];
  const j = index + delta;
  if (j < 0 || j >= next.length) {
    return next;
  }
  const tmp = next[index];
  next[index] = next[j]!;
  next[j] = tmp!;
  return next;
}

export function experienceToEditorRow(exp: AboutExperienceItem): ExperienceEditorRow {
  return {
    id: exp.id,
    position: exp.position,
    institution: exp.institution,
    duration: exp.duration,
    details: exp.details,
    achievementsText: exp.achievements.join('\n'),
    projects: [...exp.projects],
    type: exp.type,
  };
}

export function editorRowToExperience(row: ExperienceEditorRow): AboutExperienceItem {
  return {
    id: row.id.trim(),
    position: row.position.trim(),
    institution: row.institution.trim(),
    duration: row.duration.trim(),
    details: row.details.trim(),
    achievements: linesToStringArray(row.achievementsText),
    projects: row.projects.map((p) => p.trim()).filter((p) => p.length > 0),
    type: row.type,
  };
}

export function trimJourneyItem(item: AboutJourneyItem): AboutJourneyItem {
  return {
    id: item.id.trim(),
    title: item.title.trim(),
    institution: item.institution.trim(),
    year: item.year.trim(),
    details: item.details.trim(),
  };
}

export function trimAwardItem(item: AboutAwardItem): AboutAwardItem {
  return {
    id: item.id.trim(),
    title: item.title.trim(),
    organization: item.organization.trim(),
    year: item.year.trim(),
    details: item.details.trim(),
    impact: item.impact.trim(),
    category: item.category,
  };
}

export function trimSimpleListItem(item: SimpleListItem): SimpleListItem {
  const body = item.body?.trim();
  const next: SimpleListItem = {
    id: item.id.trim(),
    title: item.title.trim(),
  };
  if (body) {
    return { ...next, body };
  }
  return next;
}

export function extractEditorSliceFromSiteContent(data: SiteContent): DraftEditorSlice {
  return {
    profile: {
      displayName: data.profile.displayName,
      roleLine: data.profile.roleLine,
      homeAboutIntro: data.profile.homeAboutIntro,
      aboutIntroTagline: data.profile.aboutIntroTagline,
    },
    aboutProfessionalSummaryText: professionalSummaryParagraphsToText(
      data.about.page.professionalSummaryParagraphs,
    ),
    contact: {
      email: data.contact.info.email,
      personalEmail: data.contact.info.personalEmail,
      websiteDisplay: data.contact.info.websiteDisplay,
    },
    journey: data.about.journey.map((j) => ({ ...j })),
    experiences: data.about.experiences.map(experienceToEditorRow),
    awards: data.about.awards.map((a) => ({ ...a })),
    teaching: data.teaching.map((t) => ({ ...t })),
    supervision: data.supervision.map((t) => ({ ...t })),
    service: data.service.map((t) => ({ ...t })),
  };
}

export function mergeEditorSliceIntoSiteContent(base: SiteContent, slice: DraftEditorSlice): SiteContent {
  const next: SiteContent = structuredClone(base);
  next.profile.displayName = slice.profile.displayName.trim();
  next.profile.roleLine = slice.profile.roleLine.trim();
  next.profile.homeAboutIntro = slice.profile.homeAboutIntro.trim();
  next.profile.aboutIntroTagline = slice.profile.aboutIntroTagline.trim();
  next.about.page.professionalSummaryParagraphs = textToProfessionalSummaryParagraphs(
    slice.aboutProfessionalSummaryText,
  );
  next.contact.info.email = slice.contact.email.trim();
  next.contact.info.personalEmail = slice.contact.personalEmail.trim();
  next.contact.info.websiteDisplay = slice.contact.websiteDisplay.trim();
  next.about.journey = slice.journey.map(trimJourneyItem);
  next.about.experiences = slice.experiences.map(editorRowToExperience);
  next.about.awards = slice.awards.map(trimAwardItem);
  next.teaching = slice.teaching.map(trimSimpleListItem);
  next.supervision = slice.supervision.map(trimSimpleListItem);
  next.service = slice.service.map(trimSimpleListItem);
  return next;
}

function validateJourneyItems(items: AboutJourneyItem[]): { ok: true } | { ok: false; message: string } {
  for (let i = 0; i < items.length; i += 1) {
    const j = items[i]!;
    if (!j.id.trim()) {
      return { ok: false, message: `Academic journey #${i + 1}: id is required.` };
    }
    if (!j.title.trim() || !j.institution.trim() || !j.year.trim() || !j.details.trim()) {
      return {
        ok: false,
        message: `Academic journey #${i + 1}: title, institution, period, and details are required.`,
      };
    }
  }
  return { ok: true };
}

function validateExperienceRows(rows: ExperienceEditorRow[]): { ok: true } | { ok: false; message: string } {
  for (let i = 0; i < rows.length; i += 1) {
    const e = rows[i]!;
    if (!e.id.trim()) {
      return { ok: false, message: `Experience #${i + 1}: id is required.` };
    }
    if (!e.position.trim() || !e.institution.trim() || !e.duration.trim() || !e.details.trim()) {
      return {
        ok: false,
        message: `Experience #${i + 1}: position, institution, duration, and details are required.`,
      };
    }
  }
  return { ok: true };
}

function validateSimpleListItems(
  items: SimpleListItem[],
  label: string,
): { ok: true } | { ok: false; message: string } {
  for (let i = 0; i < items.length; i += 1) {
    const it = items[i]!;
    if (!it.id.trim()) {
      return { ok: false, message: `${label} #${i + 1}: id is required.` };
    }
    if (!it.title.trim()) {
      return { ok: false, message: `${label} #${i + 1}: title is required.` };
    }
  }
  return { ok: true };
}

function validateAwardItems(items: AboutAwardItem[]): { ok: true } | { ok: false; message: string } {
  for (let i = 0; i < items.length; i += 1) {
    const a = items[i]!;
    if (!a.id.trim()) {
      return { ok: false, message: `Award #${i + 1}: id is required.` };
    }
    if (
      !a.title.trim() ||
      !a.organization.trim() ||
      !a.year.trim() ||
      !a.details.trim() ||
      !a.impact.trim()
    ) {
      return {
        ok: false,
        message: `Award #${i + 1}: title, organization, year, details, and impact are required.`,
      };
    }
  }
  return { ok: true };
}

/** Lightweight checks before hitting the server. */
export function validateEditorSliceClient(slice: DraftEditorSlice): { ok: true } | { ok: false; message: string } {
  if (!slice.profile.displayName.trim()) {
    return { ok: false, message: 'Display name is required.' };
  }
  if (!slice.profile.roleLine.trim()) {
    return { ok: false, message: 'Role / title line is required.' };
  }
  if (!slice.profile.homeAboutIntro.trim()) {
    return { ok: false, message: 'Home intro summary is required.' };
  }
  if (!slice.profile.aboutIntroTagline.trim()) {
    return { ok: false, message: 'About tagline is required.' };
  }
  const paras = textToProfessionalSummaryParagraphs(slice.aboutProfessionalSummaryText);
  if (paras.length === 0) {
    return { ok: false, message: 'Add at least one professional summary paragraph (use blank lines between paragraphs).' };
  }
  if (!slice.contact.email.trim()) {
    return { ok: false, message: 'Official email is required.' };
  }
  if (!slice.contact.personalEmail.trim()) {
    return { ok: false, message: 'Personal email is required.' };
  }
  if (!slice.contact.websiteDisplay.trim()) {
    return { ok: false, message: 'Website display text is required.' };
  }
  const looseEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!looseEmail.test(slice.contact.email.trim()) || !looseEmail.test(slice.contact.personalEmail.trim())) {
    return { ok: false, message: 'Enter valid-looking email addresses.' };
  }
  if (slice.journey.length === 0) {
    return { ok: false, message: 'Keep at least one academic journey entry (About page).' };
  }
  if (slice.experiences.length === 0) {
    return { ok: false, message: 'Keep at least one professional experience entry.' };
  }
  if (slice.awards.length === 0) {
    return { ok: false, message: 'Keep at least one award entry.' };
  }
  const jv = validateJourneyItems(slice.journey);
  if (!jv.ok) {
    return jv;
  }
  const ev = validateExperienceRows(slice.experiences);
  if (!ev.ok) {
    return ev;
  }
  const av = validateAwardItems(slice.awards);
  if (!av.ok) {
    return av;
  }
  const tv = validateSimpleListItems(slice.teaching, 'Teaching list item');
  if (!tv.ok) {
    return tv;
  }
  const sv = validateSimpleListItems(slice.supervision, 'Supervision list item');
  if (!sv.ok) {
    return sv;
  }
  const rv = validateSimpleListItems(slice.service, 'Service list item');
  if (!rv.ok) {
    return rv;
  }
  return { ok: true };
}
