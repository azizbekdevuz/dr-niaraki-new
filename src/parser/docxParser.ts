/**
 * Main DOCX parser - orchestrates conversion using mammoth and sub-parsers
 * Conservative extraction with comprehensive warnings
 */

import mammoth from 'mammoth';

import type {
  Details,
  Education,
  Position,
  Award,
  Publication,
  Patent,
  ResearchInterest,
  ResearchProject,
  Grant,
  Contact,
  CvNarrativeSection,
} from '@/types/details';
import type { ParseWarning, DocxParseResult, DetectedSection } from '@/types/parser';

import { parseContact } from './contactParser';
import { tryFallbackPatentsFromFullText, tryFallbackPublicationsFromFullText } from './docxParserFallbacks';
import { countStudents } from './docxParserResearch';
import {
  createEmptyDocxParseAccum,
  finalizeDocxContact,
  routeDocxSection,
  type MutableDocxContact,
} from './docxParserSectionRoutes';
import {
  normalizeWhitespace,
  splitIntoSections,
  generateStableId,
  createWarning,
} from './parserUtils';

// Parser version - update when making significant changes
export const PARSER_VERSION = 'v1.2.0';

/**
 * Main function to parse DOCX buffer into structured Details
 */
export async function parseDocxToDetails(
  buffer: Buffer,
  sourceFileName: string,
  uploader?: string
): Promise<{ data: Details; warnings: ParseWarning[] }> {
  const warnings: ParseWarning[] = [];
  
  // Parse DOCX using mammoth
  const docxResult = await parseDocxBuffer(buffer);
  
  // Filter and add mammoth warnings (ignore harmless style warnings)
  const harmlessStylePatterns = [
    /unrecognised (paragraph|run) style/i,
    /style id: (whitespace|emphasis|normal)/i,
    /style id: '[^']*'/i, // Generic style ID warnings
  ];
  
  docxResult.messages.forEach((msg) => {
    // Only add warnings that aren't harmless style warnings
    const isHarmless = harmlessStylePatterns.some(pattern => pattern.test(msg.message));
    if (!isHarmless) {
      warnings.push(createWarning('docx', msg.message, msg.type));
    }
  });
  
  // Normalize text
  const text = normalizeWhitespace(docxResult.text);
  const html = docxResult.html;
  
  // Split into sections
  const sections = splitIntoSections(text);
  
  // Parse each section
  const parsedData = await parseSections(sections, text, warnings);
  
  // Construct final Details object
  const details: Details = {
    profile: {
      name: extractProfileName(text) || 'Dr. Abolghasem Sadeghi-Niaraki',
      title: extractProfileTitle(text),
      photoUrl: '/images/profpic.jpg',
      summary: parsedData.summary || null,
    },
    about: {
      brief: parsedData.summary?.slice(0, 300) || null,
      full: parsedData.fullSummary || null,
      education: parsedData.education,
      positions: parsedData.positions,
      awards: parsedData.awards,
      languages: [],
      cvNarrativeSections: parsedData.cvNarrativeSections,
    },
    research: {
      interests: extractResearchInterests(text),
      projects: parsedData.projects,
      grants: parsedData.grants,
    },
    publications: parsedData.publications,
    patents: parsedData.patents,
    contact: parsedData.contact,
    rawHtml: html,
    counts: {
      publications: parsedData.publications.length,
      patents: parsedData.patents.length,
      projects: parsedData.projects.length,
      awards: parsedData.awards.length,
      students: countStudents(text),
    },
    meta: {
      sourceFileName,
      parsedAt: new Date().toISOString(),
      parserVersion: PARSER_VERSION,
      commitSha: null,
      uploader: uploader || null,
      warnings: warnings.map(w => `${w.field}: ${w.message}`),
    },
  };
  
  return { data: details, warnings };
}

/**
 * Parses DOCX buffer to HTML and text using mammoth
 */
async function parseDocxBuffer(buffer: Buffer): Promise<DocxParseResult> {
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml({ buffer }),
    mammoth.extractRawText({ buffer }),
  ]);
  
  const messages = [
    ...htmlResult.messages.map(m => ({ type: 'warning' as const, message: m.message })),
    ...textResult.messages.map(m => ({ type: 'warning' as const, message: m.message })),
  ];
  
  return {
    html: htmlResult.value,
    text: textResult.value,
    messages,
  };
}

/**
 * Parses detected sections into structured data
 */
async function parseSections(
  sections: DetectedSection[],
  fullText: string,
  warnings: ParseWarning[]
): Promise<{
  summary: string | null;
  fullSummary: string | null;
  education: Education[];
  positions: Position[];
  awards: Award[];
  publications: Publication[];
  patents: Patent[];
  projects: ResearchProject[];
  grants: Grant[];
  contact: Contact;
  cvNarrativeSections: CvNarrativeSection[];
}> {
  const acc = createEmptyDocxParseAccum();

  for (const section of sections) {
    try {
      routeDocxSection(section, acc, warnings);
    } catch (error) {
      warnings.push(
        createWarning(
          section.type,
          `Error parsing section "${section.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error',
        ),
      );
    }
  }

  if (!acc.contact.email) {
    const headerContactResult = parseContact(fullText.slice(0, 2000));
    acc.contact = { ...acc.contact, ...headerContactResult.data } as MutableDocxContact;
    warnings.push(...headerContactResult.warnings);
  }

  let publications = acc.publications;
  let patents = acc.patents;

  if (publications.length === 0) {
    publications = tryFallbackPublicationsFromFullText(fullText, warnings);
  }

  if (patents.length === 0) {
    patents = tryFallbackPatentsFromFullText(fullText, warnings);
  }

  return {
    summary: acc.summary,
    fullSummary: acc.fullSummary,
    education: acc.education,
    positions: acc.positions,
    awards: acc.awards,
    publications,
    patents,
    projects: acc.projects,
    grants: acc.grants,
    contact: finalizeDocxContact(acc),
    cvNarrativeSections: acc.cvNarrativeSections,
  };
}

/**
 * Extracts profile name from CV header
 */
function extractProfileName(text: string): string | null {
  // Look for "Dr." prefix followed by name
  const drMatch = text.match(/Dr\.?\s*(?:Eng\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
  if (drMatch) {
    return `Dr. ${drMatch[1]}`;
  }
  
  // Look for name pattern at start
  const headerMatch = text.slice(0, 500).match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m);
  if (headerMatch && headerMatch[1]) {
    return headerMatch[1];
  }
  
  return null;
}

/**
 * Extracts profile title from CV header
 */
function extractProfileTitle(text: string): string | null {
  const titlePatterns = [
    /Associate Professor[^\n]*/i,
    /Professor[^\n]*/i,
    /Research(?:er)?[^\n]*/i,
    /Fellow[^\n]*/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.slice(0, 1000).match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return null;
}

/**
 * Extracts research interests from text
 */
function extractResearchInterests(text: string): ResearchInterest[] {
  const interests: ResearchInterest[] = [];
  
  // Known research areas from the CV
  const knownAreas = [
    { name: 'Geo-AI', keywords: ['Geospatial AI', 'Spatial Computing', 'GeoAI'] },
    { name: 'Extended Reality (XR)', keywords: ['Virtual Reality', 'Augmented Reality', 'Mixed Reality', 'Metaverse'] },
    { name: 'Human-Computer Interaction', keywords: ['HCI', 'User Interface', 'User Experience'] },
    { name: 'Internet of Things', keywords: ['IoT', 'Ubiquitous Computing', 'Sensors'] },
    { name: 'Machine Learning', keywords: ['Deep Learning', 'AI', 'Neural Networks'] },
    { name: 'Natural Language Processing', keywords: ['NLP', 'LLM', 'Language Models'] },
    { name: 'GIS & Spatial Analysis', keywords: ['Geographic Information Systems', 'Spatial Data'] },
  ];
  
  knownAreas.forEach((area, index) => {
    if (area.keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
      interests.push({
        id: generateStableId(area.name, index),
        name: area.name,
        description: `Research in ${area.name} and related technologies`,
        keywords: area.keywords,
      });
    }
  });
  
  return interests;
}

