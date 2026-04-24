/**
 * Line-anchored CV section boundaries derived from real Sejong-style CVs.
 * Replaces loose substring "headers" (e.g. lines containing the word "research")
 * that falsely split body text into fake sections.
 */

import type { SectionType } from '@/types/parser';

function stripNoise(line: string): string {
  return line.replace(/[\u00a0\t]+/g, ' ').trim();
}

/** True if this whole line starts a new top-level CV section (not a subsection label). */
export function classifyCvSectionBoundary(line: string): SectionType | null {
  const raw = stripNoise(line);
  if (!raw || raw.length > 160) {
    return null;
  }

  const s = raw.replace(/:+\s*$/, '').trim();

  // Never treat contact-ish / URL lines as section headers
  if (
    /@|https?:\/\/|www\.|linkedin\.com|\+82|tel\s*\||fax\s*\||cell\s*phone|official\s+email|personal\s+email|google\s+scholar/i.test(
      s,
    )
  ) {
    return null;
  }

  // Curriculum title / decorative
  if (/^curriculum vitae$/i.test(s) || /^#{3,}/.test(s)) {
    return null;
  }

  // Ordered rules: most specific first
  const rules: Array<{ re: RegExp; type: SectionType }> = [
    { re: /^journal\s+and\s+conference\s+reviews?\b/i, type: 'services' },
    { re: /^professional\s+summary\b/i, type: 'summary' },
    { re: /^summary\s+of\s+qualifications\b/i, type: 'summary' },
    { re: /^academic\s+qualifications\b/i, type: 'education' },
    { re: /^education(?:\s+and\s+qualifications)?$/i, type: 'education' },
    { re: /^professional\s+work\s+experiences?\b/i, type: 'experience' },
    { re: /^work\s+experience$/i, type: 'experience' },
    { re: /^research\s+experience$/i, type: 'experience' },
    { re: /^research\s+projects\s+experiences?\b/i, type: 'research' },
    {
      re: /^international\s+academic\s+initiatives\b/i,
      type: 'research',
    },
    { re: /^research\s+grants\s+and\s+achievements\b/i, type: 'grants' },
    { re: /^academic\s+leadership\s+and\s+supervision\b/i, type: 'academic_narrative' },
    { re: /^teaching\s+experiences?\b/i, type: 'services' },
    { re: /^professional\s+services?\b/i, type: 'services' },
    { re: /^workshops\s+and\s+exhibitions\b/i, type: 'workshops' },
    { re: /^skills\b/i, type: 'skills' },
    { re: /^awards\s*(?:&|and)\s*honors\b/i, type: 'awards' },
    { re: /^books\s+and\s+book\s+chapters\b/i, type: 'publications' },
    { re: /^journal\s+publications?$/i, type: 'publications' },
    { re: /^publications\b/i, type: 'publications' },
    // Main patents block only (not "International Patent" / "Registered Korean Patents" subheadings)
    { re: /^patents?\s*\(\d+/i, type: 'patents' },
    { re: /^patents?\s*$/i, type: 'patents' },
    { re: /^contact\b/i, type: 'contact' },
  ];

  for (const { re, type } of rules) {
    if (re.test(s)) {
      return type;
    }
  }

  // ALL-CAPS one-line banners that are clearly section titles (not journal names)
  if (s === s.toUpperCase() && s.length >= 12 && s.length <= 90 && !/\d{4}/.test(s)) {
    if (/^ACADEMIC APPOINTMENTS$/.test(s)) {
      return null;
    }
    if (/^JOURNAL PAPERS\b/.test(s)) {
      return null;
    }
    if (/^(BOOKS|BOOK CHAPTERS|CONFERENCE PAPERS)$/.test(s)) {
      return null;
    }
  }

  return null;
}
