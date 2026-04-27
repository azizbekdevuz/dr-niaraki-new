import type { SiteContent } from '@/content/schema';
import { applyCvNarrativeSectionsToSiteContent } from '@/server/imports/cvNarrativeToSimpleLists';
import {
  awardImpactFrom,
  nonEmptyLines,
  normalizedPublicationYear,
  patentStatus,
  patentType,
  publicationType,
} from '@/server/imports/detailsMergeNormalize';
import { mergeResearchInterestsFromDetails } from '@/server/imports/detailsMergeResearchInterests';
import type { DetailsSchemaType } from '@/validators/detailsSchema';

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

  mergeResearchInterestsFromDetails(details, next);
  applyCvNarrativeSectionsToSiteContent(details.about, next);

  return next;
}
