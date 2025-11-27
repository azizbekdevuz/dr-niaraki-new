/**
 * Parser unit tests
 * Tests for publications, patents, education, and contact parsers
 */

import { describe, it, expect } from 'vitest';

import { parseContact } from '@/parser/contactParser';
import { parseEducation, parseExperience, parseAwards } from '@/parser/educationParser';
import {
  extractYear,
  extractDoi,
  extractEmails,
  extractPhoneNumbers,
  extractPatentNumber,
  generateStableId,
  normalizeWhitespace,
  isSectionHeader,
  detectSectionType,
  splitEntries,
} from '@/parser/parserUtils';
import { parsePatents } from '@/parser/patentsParser';
import { parsePublications } from '@/parser/publicationsParser';

describe('Parser Utils', () => {
  describe('extractYear', () => {
    it('should extract year from parentheses', () => {
      expect(extractYear('Published in (2024)')).toBe(2024);
      expect(extractYear('Some paper (2023) in journal')).toBe(2023);
    });

    it('should extract standalone year', () => {
      expect(extractYear('Journal Vol. 15, 2022')).toBe(2022);
    });

    it('should return null for no year', () => {
      expect(extractYear('Some text without year')).toBeNull();
    });

    it('should ignore invalid years', () => {
      expect(extractYear('Year 1800 is too old')).toBeNull();
    });
  });

  describe('extractDoi', () => {
    it('should extract DOI from text', () => {
      expect(extractDoi('DOI: 10.1016/j.jhydrol.2024.xxx')).toBe('10.1016/j.jhydrol.2024.xxx');
    });

    it('should return null when no DOI', () => {
      expect(extractDoi('No DOI here')).toBeNull();
    });
  });

  describe('extractEmails', () => {
    it('should extract email addresses', () => {
      const emails = extractEmails('Contact: john@example.com and jane@university.edu');
      expect(emails).toContain('john@example.com');
      expect(emails).toContain('jane@university.edu');
    });

    it('should return empty array when no emails', () => {
      expect(extractEmails('No emails here')).toEqual([]);
    });
  });

  describe('extractPhoneNumbers', () => {
    it('should extract phone numbers', () => {
      const phones = extractPhoneNumbers('Tel: +82-2-1234-5678');
      expect(phones.length).toBeGreaterThan(0);
    });

    it('should filter out short numbers', () => {
      const phones = extractPhoneNumbers('ID: 12345');
      expect(phones).toEqual([]);
    });
  });

  describe('extractPatentNumber', () => {
    it('should extract US patent numbers', () => {
      expect(extractPatentNumber('US Patent 11,816,804B2')).toBe('11,816,804B2');
    });

    it('should extract Korean patent numbers', () => {
      expect(extractPatentNumber('Patent No. 10-2356500')).toBe('10-2356500');
    });
  });

  describe('generateStableId', () => {
    it('should generate consistent IDs', () => {
      const id1 = generateStableId('Test Publication Title', 0);
      const id2 = generateStableId('Test Publication Title', 0);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different text', () => {
      const id1 = generateStableId('First Title', 0);
      const id2 = generateStableId('Second Title', 0);
      expect(id1).not.toBe(id2);
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('  Multiple   spaces  ')).toBe('Multiple spaces');
      expect(normalizeWhitespace('Tab\there')).toBe('Tab here');
    });

    it('should collapse multiple newlines', () => {
      expect(normalizeWhitespace('Line1\n\n\n\nLine2')).toBe('Line1\n\nLine2');
    });
  });

  describe('isSectionHeader', () => {
    it('should detect section headers', () => {
      expect(isSectionHeader('EDUCATION')).toBe(true);
      expect(isSectionHeader('Publications:')).toBe(true);
      expect(isSectionHeader('Research Experience')).toBe(true);
    });

    it('should not detect regular text as headers', () => {
      expect(isSectionHeader('This is a long sentence that is not a header because it is too long and does not contain any keywords')).toBe(false);
    });
  });

  describe('detectSectionType', () => {
    it('should detect education sections', () => {
      expect(detectSectionType('Education and Qualifications')).toBe('education');
    });

    it('should detect experience sections', () => {
      expect(detectSectionType('Work Experience')).toBe('experience');
    });

    it('should detect publications sections', () => {
      expect(detectSectionType('Journal Publications')).toBe('publications');
    });

    it('should return unknown for unrecognized sections', () => {
      expect(detectSectionType('Random Header')).toBe('unknown');
    });
  });

  describe('splitEntries', () => {
    it('should split by numbers', () => {
      const text = '1. First entry\n2. Second entry with more text\n3. Third entry here';
      const entries = splitEntries(text);
      expect(entries.length).toBe(3);
    });

    it('should split by bullets', () => {
      const text = '• First bullet entry here\n• Second bullet entry here';
      const entries = splitEntries(text);
      expect(entries.length).toBe(2);
    });

    it('should split by double newlines', () => {
      const text = 'First paragraph with enough text\n\nSecond paragraph with enough text';
      const entries = splitEntries(text);
      expect(entries.length).toBe(2);
    });
  });
});

describe('Publications Parser', () => {
  it('should parse publication entries', () => {
    const text = `
    1. Razavi-Termeh, S. V., Sadeghi-Niaraki, A. (2024). "Cutting-Edge Strategies for Flood Mapping". Journal of Hydrology, Vol. 15. DOI: 10.1016/j.jhydrol.2024.xxx
    
    2. Another Author (2023). "Another Paper Title". Sustainability Journal.
    `;
    
    const result = parsePublications(text);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.year).toBe(2024);
  });

  it('should generate warnings for missing years', () => {
    const text = '1. Paper without a year mentioned in the text at all long enough entry';
    const result = parsePublications(text);
    expect(result.warnings.some(w => w.message.includes('year'))).toBe(true);
  });

  it('should extract DOIs', () => {
    const text = '1. Paper Title (2024). Journal Name. DOI: 10.1016/j.test.2024.001';
    const result = parsePublications(text);
    expect(result.data[0]?.doi).toBe('10.1016/j.test.2024.001');
  });
});

describe('Patents Parser', () => {
  it('should parse patent entries', () => {
    const text = `
    1. US Patent 11,816,804B2 - Nov 14, 2023
       "Tourist Accommodation Recommendation Method"
       Inventors: Abolghasem Sadeghi-Niaraki
    `;
    
    const result = parsePatents(text);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.country).toBe('US');
  });

  it('should detect patent status', () => {
    const text = '1. Korean Patent 10-2356500 Registered Jan 2022 - Test Patent Title';
    const result = parsePatents(text);
    expect(result.data[0]?.status).toBe('registered');
  });

  it('should detect pending patents', () => {
    const text = '1. Patent Application No. 18/821,509 Pending Aug 2024 - Test Title';
    const result = parsePatents(text);
    expect(result.data[0]?.status).toBe('pending');
  });
});

describe('Education Parser', () => {
  it('should parse education entries', () => {
    const text = `
    Ph.D. in Geomatics Engineering
    University of Melbourne | Australia | 2008
    Thesis: "Ontology-based Spatial Modeling"
    `;
    
    const result = parseEducation(text);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.degree).toContain('Ph.D.');
  });

  it('should extract institution', () => {
    const text = 'M.Sc. in GIS Engineering | KNTU University | Iran | 2003';
    const result = parseEducation(text);
    expect(result.data[0]?.institution).toContain('University');
  });
});

describe('Experience Parser', () => {
  it('should parse experience entries', () => {
    const text = `
    Associate Professor | INHA University | South Korea | 2022 - Present
    • Teaching graduate courses
    • Research supervision
    `;
    
    const result = parseExperience(text);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.type).toBe('academic');
  });

  it('should detect position types', () => {
    const text = 'Research Fellow | Institute of Technology | 2015 - 2020';
    const result = parseExperience(text);
    expect(result.data[0]?.type).toBe('research');
  });
});

describe('Awards Parser', () => {
  it('should parse award entries', () => {
    const text = `
    Best Paper Award 2023
    From International Conference on GIS
    For outstanding research contribution
    `;
    
    const result = parseAwards(text);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.year).toBe('2023');
  });

  it('should detect award categories', () => {
    const text = 'Excellence in Teaching Award 2022 - University Award';
    const result = parseAwards(text);
    expect(result.data[0]?.category).toBe('teaching');
  });
});

describe('Contact Parser', () => {
  it('should extract email addresses', () => {
    const text = 'Email: professor@university.edu | Personal: prof@gmail.com';
    const result = parseContact(text);
    expect(result.data.email).toBeTruthy();
  });

  it('should extract phone numbers', () => {
    const text = 'Tel: +82-2-3277-2392 | Fax: +82-2-3277-2390';
    const result = parseContact(text);
    expect(result.data.phone).toBeTruthy();
  });

  it('should detect social links', () => {
    const text = 'LinkedIn: https://linkedin.com/in/professor | ResearchGate: https://researchgate.net/profile/prof';
    const result = parseContact(text);
    expect(result.data.social.linkedin).toBeTruthy();
    expect(result.data.social.researchGate).toBeTruthy();
  });

  it('should categorize official vs personal emails', () => {
    const text = 'Contact: prof@sejong.ac.kr, personal.email@gmail.com';
    const result = parseContact(text);
    expect(result.data.email).toContain('sejong');
    expect(result.data.personalEmail).toContain('gmail');
  });
});

describe('Edge Cases', () => {
  it('should handle empty input', () => {
    expect(parsePublications('').data).toEqual([]);
    expect(parsePatents('').data).toEqual([]);
    expect(parseEducation('').data).toEqual([]);
    expect(parseExperience('').data).toEqual([]);
    expect(parseAwards('').data).toEqual([]);
  });

  it('should handle malformed entries gracefully', () => {
    const text = 'Short';
    const result = parsePublications(text);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should not crash on special characters', () => {
    const text = '1. Paper with special chars: ™ © ® € £ ¥ • – — " " \' \' (2024)';
    const result = parsePublications(text);
    expect(result.data).toBeDefined();
  });

  it('should handle Unicode text', () => {
    const text = '1. 한국어 제목 (2024). 한국 저널. Korean patent with special characters.';
    const result = parsePublications(text);
    expect(result.data).toBeDefined();
  });
});

describe('Warning Generation', () => {
  it('should generate warnings for ambiguous entries', () => {
    const text = '1. Entry without clear year or journal information - just a long text to test';
    const result = parsePublications(text);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should include entry index in warnings', () => {
    const text = '1. First entry without year longer text here\n2. Second entry also no year even longer text';
    const result = parsePublications(text);
    const warningsWithIndex = result.warnings.filter(w => w.index !== undefined);
    expect(warningsWithIndex.length).toBeGreaterThan(0);
  });
});
