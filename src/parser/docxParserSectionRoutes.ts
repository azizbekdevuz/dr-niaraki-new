/**
 * Routes each detected DOCX section into parse accumulators (keeps `parseSections` shallow).
 */

import type {
  Award,
  Contact,
  CvNarrativeSection,
  Education,
  Grant,
  Patent,
  Position,
  Publication,
  ResearchProject,
} from '@/types/details';
import type { DetectedSection, ParseWarning } from '@/types/parser';

import { parseContact } from './contactParser';
import { appendNarrativeFromDetectedSection } from './cvNarrativeExtraction';
import { parseGrantsSection, parseResearchSection } from './docxParserResearch';
import { handleUnknownSection } from './docxParserUnknownSection';
import { parseEducation, parseExperience, parseAwards } from './educationParser';
import { parsePatents } from './patentsParser';
import { parsePublications } from './publicationsParser';

/** Mutable contact while scanning sections (mirrors `docxParser` builder). */
export type MutableDocxContact = {
  email: string | null;
  personalEmail: string | null;
  phone: string | null;
  fax: string | null;
  cellPhone: string | null;
  address: string | null;
  department: string | null;
  university: string | null;
  website: string | null;
  cvUrl: string | null;
  social: Contact['social'];
};

export type DocxParseAccum = {
  summary: string | null;
  fullSummary: string | null;
  education: Education[];
  positions: Position[];
  awards: Award[];
  publications: Publication[];
  patents: Patent[];
  projects: ResearchProject[];
  grants: Grant[];
  contact: MutableDocxContact;
  cvNarrativeSections: CvNarrativeSection[];
  narrativeNext: { value: number };
};

export function createEmptyDocxParseAccum(): DocxParseAccum {
  return {
    summary: null,
    fullSummary: null,
    education: [],
    positions: [],
    awards: [],
    publications: [],
    patents: [],
    projects: [],
    grants: [],
    contact: {
      email: null,
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
    cvNarrativeSections: [],
    narrativeNext: { value: 0 },
  };
}

function applyProfileSummaryEducationExperience(
  section: DetectedSection,
  acc: DocxParseAccum,
  warnings: ParseWarning[],
): boolean {
  switch (section.type) {
    case 'summary':
    case 'profile':
      acc.summary = section.content.slice(0, 500);
      acc.fullSummary = section.content;
      return true;
    case 'education': {
      const eduResult = parseEducation(section.content);
      acc.education.push(...eduResult.data);
      warnings.push(...eduResult.warnings);
      return true;
    }
    case 'experience': {
      const expResult = parseExperience(section.content);
      acc.positions.push(...expResult.data);
      warnings.push(...expResult.warnings);
      return true;
    }
    default:
      return false;
  }
}

function applyPublicationsPatentsNarrativeAwards(
  section: DetectedSection,
  acc: DocxParseAccum,
  warnings: ParseWarning[],
): boolean {
  switch (section.type) {
    case 'publications': {
      const pubResult = parsePublications(section.content);
      if (pubResult.data.length > 0) {
        acc.publications = [...acc.publications, ...pubResult.data];
      }
      warnings.push(...pubResult.warnings);
      return true;
    }
    case 'patents': {
      const patResult = parsePatents(section.content);
      acc.patents = [...acc.patents, ...patResult.data];
      warnings.push(...patResult.warnings);
      return true;
    }
    case 'services':
    case 'workshops':
    case 'skills':
    case 'academic_narrative':
      appendNarrativeFromDetectedSection(section, acc.cvNarrativeSections, acc.narrativeNext);
      return true;
    case 'awards': {
      const awardResult = parseAwards(section.content);
      acc.awards.push(...awardResult.data);
      warnings.push(...awardResult.warnings);
      return true;
    }
    default:
      return false;
  }
}

function applyGrantsResearchContact(
  section: DetectedSection,
  acc: DocxParseAccum,
  warnings: ParseWarning[],
): boolean {
  switch (section.type) {
    case 'grants': {
      const grantProjects = parseGrantsSection(section.content);
      acc.grants.push(...grantProjects);
      return true;
    }
    case 'research': {
      const researchProjects = parseResearchSection(section.content);
      acc.projects.push(...researchProjects);
      return true;
    }
    case 'contact': {
      const contactResult = parseContact(section.content);
      acc.contact = contactResult.data as MutableDocxContact;
      warnings.push(...contactResult.warnings);
      return true;
    }
    default:
      return false;
  }
}

function applyUnknown(section: DetectedSection, acc: DocxParseAccum, warnings: ParseWarning[]): void {
  const unknownResult = handleUnknownSection(section);
  acc.publications.push(...unknownResult.publications);
  acc.patents.push(...unknownResult.patents);
  acc.projects.push(...unknownResult.projects);
  warnings.push(...unknownResult.warnings);
}

export function routeDocxSection(section: DetectedSection, acc: DocxParseAccum, warnings: ParseWarning[]): void {
  if (applyProfileSummaryEducationExperience(section, acc, warnings)) {
    return;
  }
  if (applyPublicationsPatentsNarrativeAwards(section, acc, warnings)) {
    return;
  }
  if (applyGrantsResearchContact(section, acc, warnings)) {
    return;
  }
  applyUnknown(section, acc, warnings);
}

export function finalizeDocxContact(acc: DocxParseAccum): Contact {
  return acc.contact as Contact;
}
