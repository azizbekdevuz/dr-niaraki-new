import type { SiteContent } from '@/content/schema';
import type { DetailsSchemaType } from '@/validators/detailsSchema';

function nonEmptyLines(text: string | null | undefined): string[] {
  if (!text?.trim()) {
    return [];
  }
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function publicationType(t: string | null | undefined): 'journal' | 'conference' | 'book' {
  if (t === 'chapter') {
    return 'book';
  }
  if (t === 'conference' || t === 'book') {
    return t;
  }
  return 'journal';
}

function normalizedPublicationYear(year: number | null | undefined, ceilingYear: number): number {
  if (typeof year === 'number' && !Number.isNaN(year) && year >= 1900 && year <= ceilingYear) {
    return year;
  }
  return Math.min(ceilingYear, new Date().getFullYear());
}

function awardImpactFrom(detailsText: string | null | undefined, raw: string | null | undefined, title: string, org: string, y: string): string {
  const body = (raw?.trim() || detailsText?.trim() || '').trim();
  if (body.length > 0) {
    return body.slice(0, 500);
  }
  if (org.trim() && y.trim()) {
    return `${title.trim()} (${org.trim()}, ${y.trim()})`.slice(0, 500);
  }
  return detailsText?.trim().slice(0, 500) || '—';
}

function patentStatus(s: string | null | undefined): 'registered' | 'pending' {
  return s === 'registered' ? 'registered' : 'pending';
}

function patentType(t: string | null | undefined): 'international' | 'korean' {
  return t === 'korean' ? 'korean' : 'international';
}

/**
 * Merges CV `Details` (parser output) into an existing `SiteContent` baseline.
 * Keeps non-editor slices (home, layout, meta, most research chrome) from `base` while updating
 * profile/about/contact and list-backed sections that the `/admin/content` editor cares about.
 */
export function mergeCvDetailsIntoSiteContent(details: DetailsSchemaType, base: SiteContent): SiteContent {
  const next: SiteContent = structuredClone(base);
  const yearCeiling = new Date().getFullYear() + 1;
  const experienceById = new Map(base.about.experiences.map((e) => [e.id.trim(), e]));

  next.profile.displayName = details.profile.name.trim() || next.profile.displayName;
  next.profile.roleLine = (details.profile.title ?? next.profile.roleLine).trim() || next.profile.roleLine;

  const summaryBits = [
    ...nonEmptyLines(details.profile.summary ?? undefined),
    ...nonEmptyLines(details.about.brief ?? undefined),
    ...nonEmptyLines(details.about.full ?? undefined),
  ];
  const paras = summaryBits.length > 0 ? summaryBits : next.about.page.professionalSummaryParagraphs;
  next.about.page.professionalSummaryParagraphs = paras;
  next.profile.homeAboutIntro =
    (details.profile.summary ?? details.about.brief ?? next.profile.homeAboutIntro).trim().slice(0, 1200) ||
    next.profile.homeAboutIntro;
  next.profile.aboutIntroTagline = (
    details.about.brief ??
    details.profile.title ??
    next.profile.aboutIntroTagline
  )
    .trim()
    .slice(0, 800);

  next.about.journey = details.about.education.map((ed) => ({
    id: ed.id.trim(),
    title: ed.degree.trim(),
    institution: ed.institution.trim(),
    year: (ed.period ?? ed.year ?? '—').toString().trim(),
    details: (ed.details ?? ed.thesis ?? ed.raw ?? '—').toString().trim(),
  }));

  next.about.experiences = details.about.positions.map((p) => {
    const id = p.id.trim();
    const previous = experienceById.get(id);
    return {
      id,
      position: p.title.trim(),
      institution: p.institution.trim(),
      duration: p.period.trim(),
      details: (p.details ?? p.raw ?? '—').toString().trim(),
      achievements: [...(p.achievements ?? [])],
      projects: previous?.projects?.length ? [...previous.projects] : [],
      type: p.type === 'research' || p.type === 'consulting' ? p.type : 'academic',
    };
  });

  next.about.awards = details.about.awards.map((a) => {
    const org = (a.organization ?? '—').toString().trim();
    const year = (a.year ?? '—').toString().trim();
    const detailsText = (a.details ?? '—').toString().trim();
    return {
      id: a.id.trim(),
      title: a.title.trim(),
      organization: org,
      year,
      details: detailsText,
      impact: awardImpactFrom(a.details ?? null, a.raw ?? null, a.title, org, year),
      category: a.category === 'teaching' || a.category === 'service' ? a.category : 'research',
    };
  });

  const email = details.contact.email?.trim() || next.contact.info.email;
  const personal = details.contact.personalEmail?.trim() || next.contact.info.personalEmail;
  const web = details.contact.website?.trim() || next.contact.info.websiteDisplay;
  next.contact.info.email = email;
  next.contact.info.personalEmail = personal;
  next.contact.info.websiteDisplay = web;

  next.publications.items = details.publications.map((pub) => ({
    id: pub.id.trim(),
    title: pub.title.trim(),
    authors: (pub.authors ?? '—').toString().trim(),
    journal: (pub.journal ?? '—').toString().trim(),
    year: normalizedPublicationYear(pub.year ?? null, yearCeiling),
    type: publicationType(pub.type ?? undefined),
    impactFactor: pub.impactFactor ?? undefined,
    quartile: pub.quartile ?? undefined,
    doi: pub.doi ?? undefined,
  }));

  const pj = next.publications.items.filter((i) => i.type === 'journal').length;
  const pc = next.publications.items.filter((i) => i.type === 'conference').length;
  const pb = next.publications.items.filter((i) => i.type === 'book').length;
  next.publications.stats = {
    total: next.publications.items.length,
    journals: pj,
    conferences: pc,
    books: pb,
    phdAdvised: next.publications.stats.phdAdvised,
  };

  next.patents.items = details.patents.map((pt) => ({
    id: pt.id.trim(),
    title: pt.title.trim(),
    number: (pt.number ?? '—').toString().trim(),
    country: (pt.country ?? '—').toString().trim(),
    date: (pt.date ?? '—').toString().trim(),
    inventors: (pt.inventors ?? '—').toString().trim(),
    status: patentStatus(pt.status ?? undefined),
    type: patentType(pt.type ?? undefined),
  }));

  const pi = next.patents.items.filter((i) => i.type === 'international').length;
  const pk = next.patents.items.filter((i) => i.type === 'korean').length;
  const pend = next.patents.items.filter((i) => i.status === 'pending').length;
  next.patents.stats = {
    total: next.patents.items.length,
    international: pi,
    korean: pk,
    pending: pend,
  };

  const candInterests = details.research.interests;
  const baseInterests = [...next.research.interests];
  const nInt = Math.min(candInterests.length, baseInterests.length);
  for (let i = 0; i < nInt; i += 1) {
    const d = candInterests[i]!;
    const row = baseInterests[i]!;
    baseInterests[i] = {
      ...row,
      name: d.name.trim(),
      description: (d.description?.trim() || row.description).trim(),
      keywords: d.keywords && d.keywords.length > 0 ? [...d.keywords] : [...row.keywords],
    };
  }
  next.research.interests = baseInterests;

  return next;
}
