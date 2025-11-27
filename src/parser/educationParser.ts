/**
 * Education and Experience parser
 * Extracts academic qualifications and work experiences from CV text
 */

import type { Education, Position, Award, MutableEducation, MutablePosition, MutableAward } from '@/types/details';
import type { ParseWarning, ParseResult } from '@/types/parser';

import {
  generateStableId,
  extractYear,
  splitEntries,
  createWarning,
} from './parserUtils';

/**
 * Parses education section text into structured data
 */
export function parseEducation(text: string): ParseResult<Education[]> {
  const warnings: ParseWarning[] = [];
  const education: Education[] = [];
  
  const entries = splitEntries(text);
  
  entries.forEach((entry, index) => {
    const edu = parseEducationEntry(entry, index, warnings);
    if (edu) {
      education.push(edu);
    }
  });
  
  return { data: education, warnings };
}

/**
 * Parses a single education entry
 */
function parseEducationEntry(
  text: string,
  index: number,
  warnings: ParseWarning[]
): Education | null {
  const trimmed = text.trim();
  
  if (trimmed.length < 20) {
    return null;
  }
  
  const edu: MutableEducation = {
    id: generateStableId(trimmed, index),
    degree: '',
    institution: '',
    location: null,
    year: null,
    period: null,
    thesis: null,
    supervisor: null,
    details: null,
    raw: trimmed,
  };
  
  // Extract degree type
  const degreePatterns = [
    { pattern: /Ph\.?D\.?|Doctor(?:ate)?/i, type: 'Ph.D.' },
    { pattern: /Post-?Doc(?:toral)?|Post-?Doctoral Fellowship/i, type: 'Post-Doctoral' },
    { pattern: /M\.?Sc\.?|Master(?:'?s)?/i, type: 'M.Sc.' },
    { pattern: /B\.?Sc\.?|Bachelor(?:'?s)?/i, type: 'B.Sc.' },
    { pattern: /Fellow(?:ship)?/i, type: 'Fellowship' },
  ];
  
  for (const { pattern, type } of degreePatterns) {
    if (pattern.test(trimmed)) {
      edu.degree = type;
      break;
    }
  }
  
  if (!edu.degree) {
    // Use first line as degree description
    const firstLine = trimmed.split('\n')[0];
    if (firstLine && firstLine.length > 100) {
      edu.degree = firstLine.slice(0, 100);
    } else {
      edu.degree = firstLine ?? '';
    }
    warnings.push(createWarning('education', `Education ${index + 1}: degree type unclear`, 'info', index));
  }
  
  // Extract field of study
  const fieldMatch = trimmed.match(/(?:in|of)\s+([A-Za-z\-]+(?:\s+[A-Za-z\-]+){0,3}\s+(?:Engineering|Science|Studies|Technology))/i);
  if (fieldMatch) {
    edu.degree = `${edu.degree} in ${fieldMatch[1]}`;
  }
  
  // Extract institution
  const institutionPatterns = [
    /(?:University|Institute|College|School)[^,\n]*/i,
    /(?:INHA|KNTU|Sejong)[^,\n]*/i,
    /\|?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+University)/,
  ];
  
  for (const pattern of institutionPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      edu.institution = match[0].replace(/^\|?\s*/, '').trim();
      break;
    }
  }
  
  if (!edu.institution) {
    warnings.push(createWarning('education', `Education ${index + 1}: institution not found`, 'warning', index));
    edu.institution = 'Unknown Institution';
  }
  
  // Extract location
  const locationPatterns = [
    /(South Korea|Korea|Australia|Iran|USA|United States)/i,
    /,\s*([A-Za-z]+)$/,
  ];
  
  for (const pattern of locationPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      edu.location = match[1];
      break;
    }
  }
  
  // Extract year/period
  const periodMatch = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4}|\bPresent\b)/i);
  if (periodMatch) {
    edu.period = `${periodMatch[1]} - ${periodMatch[2]}`;
    edu.year = periodMatch[2] === 'Present' ? periodMatch[1] : periodMatch[2];
  } else {
    const year = extractYear(trimmed);
    if (year) {
      edu.year = year.toString();
    }
  }
  
  // Extract thesis
  const thesisMatch = trimmed.match(/(?:Thesis|Dissertation)[:\s]+[""]?([^"""\n]+)[""]?/i);
  if (thesisMatch) {
    edu.thesis = thesisMatch[1]?.trim() ?? '';
  }
  
  // Extract supervisor
  const supervisorMatch = trimmed.match(/Supervisor[s]?[:\s]+(?:Prof\.?\s*)?([^\n]+)/i);
  if (supervisorMatch) {
    edu.supervisor = supervisorMatch[1]?.trim() ?? '';
  }
  
  // Extract details (remaining text)
  const lines = trimmed.split('\n').slice(1);
  if (lines.length > 0) {
    edu.details = lines.join('\n').trim();
  }
  
  return edu as Education;
}

/**
 * Parses work experience section text into structured data
 */
export function parseExperience(text: string): ParseResult<Position[]> {
  const warnings: ParseWarning[] = [];
  const positions: Position[] = [];
  
  const entries = splitEntries(text);
  
  entries.forEach((entry, index) => {
    const position = parseExperienceEntry(entry, index, warnings);
    if (position) {
      positions.push(position);
    }
  });
  
  return { data: positions, warnings };
}

/**
 * Parses a single experience entry
 */
function parseExperienceEntry(
  text: string,
  index: number,
  warnings: ParseWarning[]
): Position | null {
  const trimmed = text.trim();
  
  if (trimmed.length < 20) {
    return null;
  }
  
  const position: MutablePosition = {
    id: generateStableId(trimmed, index),
    title: '',
    institution: '',
    location: null,
    period: '',
    type: 'other',
    details: null,
    achievements: [],
    raw: trimmed,
  };
  
  // Extract position title
  const titlePatterns = [
    /^((?:Associate\s+)?Professor|Research(?:er)?|Consultant|Manager|Director|Fellow)[^|\n]*/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s*\|/,
  ];
  
  for (const pattern of titlePatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      position.title = match[1]?.trim() ?? '';
      break;
    }
  }
  
  if (!position.title) {
    position.title = trimmed.split('\n')[0]?.slice(0, 100) ?? '';
  }
  
  // Determine position type
  const lowerText = trimmed.toLowerCase();
  if (lowerText.includes('professor') || lowerText.includes('lecturer') || lowerText.includes('teaching')) {
    position.type = 'academic';
  } else if (lowerText.includes('research') || lowerText.includes('fellow') || lowerText.includes('scientist')) {
    position.type = 'research';
  } else if (lowerText.includes('consultant') || lowerText.includes('advisor')) {
    position.type = 'consulting';
  } else if (lowerText.includes('manager') || lowerText.includes('engineer') || lowerText.includes('developer')) {
    position.type = 'industry';
  }
  
  // Extract institution
  const institutionPatterns = [
    /(?:University|Institute|Company|Corporation|Inc\.|Corp\.|Ltd\.)[^,\n]*/i,
    /(?:INHA|KNTU|Sejong|HANCOM|KSIC)[^,\n]*/i,
  ];
  
  for (const pattern of institutionPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      position.institution = match[0].trim();
      break;
    }
  }
  
  if (!position.institution) {
    position.institution = 'Unknown Organization';
  }
  
  // Extract period
  const periodMatch = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4}|\bPresent\b)/i);
  if (periodMatch) {
    position.period = `${periodMatch[1]} - ${periodMatch[2]}`;
  } else {
    const year = extractYear(trimmed);
    position.period = year ? year.toString() : 'Unknown';
    warnings.push(createWarning('experience', `Position ${index + 1}: period unclear`, 'info', index));
  }
  
  // Extract location
  const locationMatch = trimmed.match(/(South Korea|Korea|Australia|Iran|USA|Seoul|Incheon|Tehran)/i);
  if (locationMatch) {
    position.location = locationMatch[1];
  }
  
  // Extract achievements (bulleted items)
  const bulletItems = trimmed.match(/[•·\-]\s*([^\n]+)/g);
  if (bulletItems) {
    position.achievements = bulletItems.map(item => 
      item.replace(/^[•·\-]\s*/, '').trim()
    );
  }
  
  // Extract details
  const lines = trimmed.split('\n');
  const detailLines = lines.filter(line => 
    !line.match(/^\d{4}/) && 
    !line.match(/^[•·\-]/) &&
    line.trim().length > 10
  );
  if (detailLines.length > 1) {
    position.details = detailLines.slice(1).join('\n').trim();
  }
  
  return position as Position;
}

/**
 * Parses awards section text into structured data
 */
export function parseAwards(text: string): ParseResult<Award[]> {
  const warnings: ParseWarning[] = [];
  const awards: Award[] = [];
  
  const entries = splitEntries(text);
  
  entries.forEach((entry, index) => {
    const award = parseAwardEntry(entry, index);
    if (award) {
      awards.push(award);
    }
  });
  
  return { data: awards, warnings };
}

/**
 * Parses a single award entry
 */
function parseAwardEntry(
  text: string,
  index: number
): Award | null {
  const trimmed = text.trim();
  
  if (trimmed.length < 20) {
    return null;
  }
  
  const award: MutableAward = {
    id: generateStableId(trimmed, index),
    title: '',
    organization: null,
    year: null,
    category: null,
    details: null,
    raw: trimmed,
  };
  
  // Extract year
  const year = extractYear(trimmed);
  if (year) {
    award.year = year.toString();
  }
  
  // Extract title (first line or before year)
  const titleEnd = trimmed.search(/\d{4}/);
  if (titleEnd > 0) {
    award.title = trimmed.slice(0, titleEnd).trim();
  } else {
    award.title = trimmed.split('\n')[0]?.slice(0, 150) ?? '';
  }
  
  // Determine category
  const lowerText = trimmed.toLowerCase();
  if (lowerText.includes('research') || lowerText.includes('scientist') || lowerText.includes('paper')) {
    award.category = 'research';
  } else if (lowerText.includes('teaching') || lowerText.includes('educator') || lowerText.includes('instructor')) {
    award.category = 'teaching';
  } else if (lowerText.includes('service') || lowerText.includes('community') || lowerText.includes('volunteer')) {
    award.category = 'service';
  } else {
    award.category = 'other';
  }
  
  // Extract organization
  const orgPatterns = [
    /from (?:the )?([A-Z][^\n,]+)/i,
    /(?:by|awarded by)\s+(?:the\s+)?([A-Z][^\n,]+)/i,
    /(University|Institute|Foundation|Association|Government|Ministry)[^\n,]*/i,
  ];
  
  for (const pattern of orgPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      award.organization = match[1]?.trim() ?? '';
      break;
    }
  }
  
  // Extract details
  const lines = trimmed.split('\n').slice(1);
  if (lines.length > 0) {
    award.details = lines.join('\n').trim();
  }
  
  return award as Award;
}
