/**
 * Main DOCX parser - orchestrates conversion using mammoth and sub-parsers
 * Conservative extraction with comprehensive warnings
 */

import mammoth from 'mammoth';

import type { Details, Education, Position, Award, Publication, Patent, ResearchInterest, ResearchProject, Grant, Contact, SocialLinks } from '@/types/details';
import type { ParseWarning, DocxParseResult, DetectedSection } from '@/types/parser';

import { parseContact } from './contactParser';
import { parseEducation, parseExperience, parseAwards } from './educationParser';
import {
  normalizeWhitespace,
  splitIntoSections,
  generateStableId,
  createWarning,
} from './parserUtils';
import { parsePatents } from './patentsParser';
import { parsePublications } from './publicationsParser';

// Parser version - update when making significant changes
export const PARSER_VERSION = 'v1.0.0';

// Mutable contact type for building
interface MutableContact {
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
  social: SocialLinks;
}

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
}> {
  let summary: string | null = null;
  let fullSummary: string | null = null;
  const education: Education[] = [];
  const positions: Position[] = [];
  const awards: Award[] = [];
  let publications: Publication[] = [];
  let patents: Patent[] = [];
  const projects: ResearchProject[] = [];
  const grants: Grant[] = [];
  let contact: MutableContact = {
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
  };
  
  for (const section of sections) {
    try {
      switch (section.type) {
        case 'summary':
        case 'profile': {
          summary = section.content.slice(0, 500);
          fullSummary = section.content;
          break;
        }
          
        case 'education': {
          const eduResult = parseEducation(section.content);
          education.push(...eduResult.data);
          warnings.push(...eduResult.warnings);
          break;
        }
          
        case 'experience': {
          const expResult = parseExperience(section.content);
          positions.push(...expResult.data);
          warnings.push(...expResult.warnings);
          break;
        }
          
        case 'publications': {
          const pubResult = parsePublications(section.content);
          publications = pubResult.data;
          warnings.push(...pubResult.warnings);
          break;
        }
          
        case 'patents': {
          const patResult = parsePatents(section.content);
          patents = patResult.data;
          warnings.push(...patResult.warnings);
          break;
        }
          
        case 'awards': {
          const awardResult = parseAwards(section.content);
          awards.push(...awardResult.data);
          warnings.push(...awardResult.warnings);
          break;
        }
          
        case 'grants': {
          const grantProjects = parseGrantsSection(section.content);
          grants.push(...grantProjects);
          break;
        }
          
        case 'research': {
          const researchProjects = parseResearchSection(section.content);
          projects.push(...researchProjects);
          break;
        }
          
        case 'contact': {
          const contactResult = parseContact(section.content);
          contact = contactResult.data as MutableContact;
          warnings.push(...contactResult.warnings);
          break;
        }
          
        default: {
          // Unknown section - only warn if it has substantial content and isn't a common header
          const commonHeaders = ['header', 'footer', 'page', 'table of contents', 'references', 'appendix'];
          const isCommonHeader = commonHeaders.some(h => section.title.toLowerCase().includes(h));
          
          if (section.content.length > 100 && !isCommonHeader) {
            warnings.push(createWarning(
              'unknown_section',
              `Unrecognized section: "${section.title.slice(0, 50)}" - please review`,
              'info'
            ));
          }
        }
      }
    } catch (error) {
      warnings.push(createWarning(
        section.type,
        `Error parsing section "${section.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      ));
    }
  }
  
  // If no contact section found, try to extract from header
  if (!contact.email) {
    const headerContactResult = parseContact(fullText.slice(0, 2000));
    contact = { ...contact, ...headerContactResult.data } as MutableContact;
    warnings.push(...headerContactResult.warnings);
  }
  
  // If no publications section found, try to find them in full text
  if (publications.length === 0) {
    const pubMatch = fullText.match(/JOURNAL PAPERS[\s\S]*?(?=\n[A-Z]{2,}|\n{3}|$)/i);
    if (pubMatch) {
      const pubResult = parsePublications(pubMatch[0]);
      publications = pubResult.data;
      warnings.push(...pubResult.warnings);
    } else {
      warnings.push(createWarning('publications', 'No publications section found', 'warning'));
    }
  }
  
  // If no patents section found, try to find them
  if (patents.length === 0) {
    const patMatch = fullText.match(/Patents[\s\S]*?(?=\n[A-Z]{2,}[\s]*\n|\n{3}|$)/i);
    if (patMatch) {
      const patResult = parsePatents(patMatch[0]);
      patents = patResult.data;
      warnings.push(...patResult.warnings);
    }
  }
  
  return {
    summary,
    fullSummary,
    education,
    positions,
    awards,
    publications,
    patents,
    projects,
    grants,
    contact: contact as Contact,
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

/**
 * Parses grants section
 */
function parseGrantsSection(text: string): Grant[] {
  const grantsResult: Grant[] = [];
  
  // Split by project entries
  const entries = text.split(/(?=Project title:|Funding:)/i).filter(e => e.trim().length > 50);
  
  entries.forEach((entry, index) => {
    const titleMatch = entry.match(/Project title:\s*([^\n]+)/i);
    const fundingMatch = entry.match(/Funding:\s*([^\n]+)/i);
    const periodMatch = entry.match(/Duration:\s*([^\n]+)/i) || entry.match(/(\d{4}\s*[-–]\s*\d{4})/);
    const roleMatch = entry.match(/Role:\s*([^\n]+)/i);
    const agencyMatch = entry.match(/Funding Agency:\s*([^\n]+)/i);
    
    if (titleMatch && titleMatch[1]) {
      grantsResult.push({
        id: generateStableId(titleMatch[1], index),
        title: titleMatch[1].trim(),
        fundingAgency: agencyMatch?.[1]?.trim() ?? null,
        amount: fundingMatch?.[1]?.trim() ?? null,
        period: periodMatch?.[1]?.trim() ?? null,
        role: roleMatch?.[1]?.trim() ?? null,
        raw: entry.trim(),
      });
    }
  });
  
  return grantsResult;
}

/**
 * Parses research projects section
 */
function parseResearchSection(text: string): ResearchProject[] {
  const projectsResult: ResearchProject[] = [];
  
  // Split by project entries
  const entries = text.split(/\n(?=[A-Z][^\n]*\s*\|)/);
  
  entries.forEach((entry, index) => {
    const trimmed = entry.trim();
    if (trimmed.length < 30) {
      return;
    }
    
    const lines = trimmed.split('\n');
    const title = lines[0]?.split('|')[0]?.trim() || '';
    
    const periodMatch = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4}|\bPresent\b)/i);
    const fundingMatch = trimmed.match(/\$[\d,]+|\d+,?\d*\s*USD/i);
    
    if (title) {
      projectsResult.push({
        id: generateStableId(title, index),
        title,
        description: lines.slice(1).join('\n').trim() || null,
        period: periodMatch ? `${periodMatch[1]} - ${periodMatch[2]}` : null,
        funding: null,
        fundingAmount: fundingMatch?.[0] || null,
        role: null,
        status: periodMatch?.[2]?.toLowerCase() === 'present' ? 'ongoing' : 'completed',
        raw: trimmed,
      });
    }
  });
  
  return projectsResult;
}

/**
 * Counts supervised students mentioned in text
 */
function countStudents(text: string): number {
  const match = text.match(/(?:supervised?|mentored?)\s*(?:more than\s+)?(\d+)\+?\s*(?:Master|PhD|graduate)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  // Count listed students
  const studentSection = text.match(/(?:Master|PhD)\s*Students?[\s\S]*?(?=\n[A-Z]{2,}|\n{3}|Professional|$)/i);
  if (studentSection) {
    const names = studentSection[0].match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\s*[-–]/g);
    return names?.length || 0;
  }
  
  return 0;
}
