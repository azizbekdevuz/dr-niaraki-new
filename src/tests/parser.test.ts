/**
 * Parser unit tests
 * Tests for publications, patents, education, and contact parsers
 */

import { describe, it, expect } from 'vitest';
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
import { parsePublications } from '@/parser/publicationsParser';
import { parsePatents } from '@/parser/patentsParser';
import { parseContact } from '@/parser/contactParser';
import { parseEducation, parseExperience, parseAwards } from '@/parser/educationParser';

describe('Parser Utils', () => {
  describe('extractYear', () => {
    it('should extract year from parentheses', () => {
      expect(extractYear('Published in (2024)')).toBe(2024);
      expect(extractYear('Some paper (2023) in journal')).toBe(2023);
    });

    it('should extract year from text', () => {
      expect(extractYear('Published 2024 in Nature')).toBe(2024);
      expect(extractYear('From 2019 to 2023')).toBe(2019);
    });

    it('should return null for invalid years', () => {
      expect(extractYear('No year here')).toBe(null);
      expect(extractYear('Year 1800 is too old')).toBe(null);
    });
  });

  describe('extractDoi', () => {
    it('should extract DOI from text', () => {
      expect(extractDoi('DOI: 10.1016/j.jhydrol.2024.xxx')).toBe('10.1016/j.jhydrol.2024.xxx');
      expect(extractDoi('https://doi.org/10.3390/su142315681')).toBe('10.3390/su142315681');
    });

    it('should return null if no DOI found', () => {
      expect(extractDoi('No DOI in this text')).toBe(null);
    });
  });

  describe('extractEmails', () => {
    it('should extract email addresses', () => {
      const text = 'Contact: a.sadeghi@sejong.ac.kr or a.sadeqi313@gmail.com';
      const emails = extractEmails(text);
      expect(emails).toHaveLength(2);
      expect(emails).toContain('a.sadeghi@sejong.ac.kr');
      expect(emails).toContain('a.sadeqi313@gmail.com');
    });

    it('should return empty array if no emails', () => {
      expect(extractEmails('No emails here')).toHaveLength(0);
    });
  });

  describe('extractPhoneNumbers', () => {
    it('should extract Korean phone numbers', () => {
      const text = 'Tel: +82 2-3408-2981, Cell: +82 10 4253-5-313';
      const phones = extractPhoneNumbers(text);
      expect(phones.length).toBeGreaterThan(0);
    });

    it('should filter out short numbers', () => {
      const text = 'Number: 123';
      expect(extractPhoneNumbers(text)).toHaveLength(0);
    });
  });

  describe('extractPatentNumber', () => {
    it('should extract US patent numbers', () => {
      expect(extractPatentNumber('US Patent (US11,816,804B2)')).toBe('11,816,804B2');
      expect(extractPatentNumber('US11816804')).toMatch(/11816804/);
    });

    it('should extract Korean patent numbers', () => {
      expect(extractPatentNumber('Patent No. 10-2356500')).toBe('10-2356500');
    });
  });

  describe('generateStableId', () => {
    it('should generate consistent IDs', () => {
      const id1 = generateStableId('Test title', 0);
      const id2 = generateStableId('Test title', 0);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different texts', () => {
      const id1 = generateStableId('First title', 0);
      const id2 = generateStableId('Second title', 0);
      expect(id1).not.toBe(id2);
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize line breaks', () => {
      expect(normalizeWhitespace('Line1\r\nLine2\rLine3')).toBe('Line1\nLine2\nLine3');
    });

    it('should reduce multiple newlines', () => {
      expect(normalizeWhitespace('Text\n\n\n\nMore')).toBe('Text\n\nMore');
    });

    it('should reduce multiple spaces', () => {
      expect(normalizeWhitespace('Too    many   spaces')).toBe('Too many spaces');
    });
  });

  describe('isSectionHeader', () => {
    it('should detect known section headers', () => {
      expect(isSectionHeader('EDUCATION')).toBe(true);
      expect(isSectionHeader('Professional Experience:')).toBe(true);
      expect(isSectionHeader('Publications')).toBe(true);
    });

    it('should not detect regular text as headers', () => {
      expect(isSectionHeader('This is a regular sentence about something.')).toBe(false);
    });
  });

  describe('detectSectionType', () => {
    it('should detect education sections', () => {
      expect(detectSectionType('Academic Qualifications')).toBe('education');
      expect(detectSectionType('EDUCATION')).toBe('education');
    });

    it('should detect experience sections', () => {
      expect(detectSectionType('Professional Work Experiences')).toBe('experience');
      expect(detectSectionType('ACADEMIC APPOINTMENTS')).toBe('experience');
    });

    it('should detect publications sections', () => {
      expect(detectSectionType('JOURNAL PAPERS (SCIE, SCI, SSCI)')).toBe('publications');
    });

    it('should detect patents sections', () => {
      expect(detectSectionType('Patents (42 Registered & Completed)')).toBe('patents');
    });
  });

  describe('splitEntries', () => {
    it('should split numbered entries', () => {
      const text = '1. First entry\n2. Second entry\n3. Third entry';
      const entries = splitEntries(text);
      expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    it('should split bulleted entries', () => {
      const text = '• First item\n• Second item\n• Third item';
      const entries = splitEntries(text);
      expect(entries.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Publications Parser', () => {
  it('should parse a simple publication entry', () => {
    const text = `Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al. (2024). Cutting-Edge Strategies for Absence Data Identification in Natural Hazards. Journal of Hydrology. (SCIE-Q1-IF: 5.9)`;
    
    const result = parsePublications(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.year).toBe(2024);
    expect(result.data[0]?.quartile).toBe('Q1');
  });

  it('should extract impact factor', () => {
    const text = `Some paper. Journal Name. (IF: 8.5)`;
    const result = parsePublications(text);
    
    expect(result.data[0]?.impactFactor).toBe('8.5');
  });

  it('should generate warnings for missing year', () => {
    const text = `A paper without year information in some journal name`;
    const result = parsePublications(text);
    
    expect(result.warnings.some(w => w.message.includes('year not found'))).toBe(true);
  });

  it('should handle multiple publications', () => {
    const text = `
1. First paper (2024). Journal A.
2. Second paper (2023). Journal B.
3. Third paper (2022). Journal C.
    `;
    
    const result = parsePublications(text);
    expect(result.data.length).toBe(3);
  });
});

describe('Patents Parser', () => {
  it('should parse US patent entry', () => {
    const text = `US International Patent (US11,816,804B2) - Nov 14, 2023
Title: "Tourist Accommodation Recommendation Method and System Using Multi-Criteria Decision-Making and Augmented Reality"
Inventors: Abolghasem Sadeghi-Niaraki, Soo-Mi Choi`;
    
    const result = parsePatents(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.country).toBe('US');
    expect(result.data[0]?.type).toBe('international');
  });

  it('should parse Korean patent entry', () => {
    const text = `Patent No. 10-2356500 (Jan 24, 2022)
Title: "Geospatial Information System-Based Modeling Approach"
Inventors: Abolghasem Sadeghi-Niaraki, Soo-Mi Choi
Registered`;
    
    const result = parsePatents(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.type).toBe('korean');
    expect(result.data[0]?.status).toBe('registered');
  });

  it('should detect pending status', () => {
    const text = `Application No. 10-2023-0068491 (May 26, 2023) Patent application completed
Title: "Ubiquitous GIS-Based Outdoor Evacuation Support"`;
    
    const result = parsePatents(text);
    expect(result.data[0]?.status).toBe('pending');
  });
});

describe('Contact Parser', () => {
  it('should extract email addresses', () => {
    const text = `Official Email | a.sadeghi@sejong.ac.kr
Personal Email | a.sadeqi313@gmail.com`;
    
    const result = parseContact(text);
    
    expect(result.data?.email).toBe('a.sadeghi@sejong.ac.kr');
    expect(result.data?.personalEmail).toBe('a.sadeqi313@gmail.com');
  });

  it('should extract phone numbers', () => {
    const text = `Tel | +82 2-3408-2981
Fax | +82 2-3408-4321
Cell Phone | +82 10 4253-5-313`;
    
    const result = parseContact(text);
    
    expect(result.data?.phone).toBeTruthy();
    expect(result.data?.fax).toBeTruthy();
    expect(result.data?.cellPhone).toBeTruthy();
  });

  it('should extract website', () => {
    const text = `Website | www.abolghasemsadeghi-n.com`;
    const result = parseContact(text);
    
    expect(result.data?.website).toContain('abolghasemsadeghi-n.com');
  });

  it('should extract LinkedIn', () => {
    const text = `LinkedIn | linkedin.com/in/abolghasemsadeghi-n`;
    const result = parseContact(text);
    
    expect(result.data?.social?.linkedin).toBeTruthy();
  });
});

describe('Education Parser', () => {
  it('should parse PhD entry', () => {
    const text = `Ph.D. in Geo-Informatics Engineering | INHA University, South Korea
March 2005 - August 2008
Dissertation: "Ontology based geospatial model for personalized route finding"`;
    
    const result = parseEducation(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.degree).toContain('Ph.D');
    expect(result.data[0]?.institution).toContain('INHA');
  });

  it('should parse MSc entry', () => {
    const text = `M.Sc. in GIS Engineering | K.N. Toosi University of Technology (KNTU)
February 2000 - November 2002`;
    
    const result = parseEducation(text);
    
    expect(result.data[0]?.degree).toContain('M.Sc');
  });
});

describe('Experience Parser', () => {
  it('should parse academic position', () => {
    const text = `Associate Professor | Department of Computer Science & Engineering, Sejong University, Seoul, South Korea
March 2017 - Present
Led cutting-edge research on advanced XR and Geo-AI technologies`;
    
    const result = parseExperience(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.type).toBe('academic');
    expect(result.data[0]?.title).toContain('Professor');
  });

  it('should parse consulting position', () => {
    const text = `International Consultant | Hancom, Inc., Seoul, South Korea
2016 - 2017`;
    
    const result = parseExperience(text);
    
    expect(result.data[0]?.type).toBe('consulting');
  });
});

describe('Awards Parser', () => {
  it('should parse award entry', () => {
    const text = `TOP 2% OF SCIENTISTS WORLDWIDE (Stanford-Elsevier 2024 dataset) 2024
Recognized for contributions to Geo-AI and spatial analysis`;
    
    const result = parseAwards(text);
    
    expect(result.data.length).toBe(1);
    expect(result.data[0]?.year).toBe('2024');
    expect(result.data[0]?.category).toBe('research');
  });
});

