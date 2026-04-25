/**
 * Contact parser - extracts contact information from CV text
 */

import type { Contact } from '@/types/details';
import type { ParseWarning, ParseResult } from '@/types/parser';

import {
  extractEmails,
  extractPhoneNumbers,
  extractUrls,
  createWarning,
} from './parserUtils';

// Mutable version for building
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
  social: MutableSocialLinks;
}

interface MutableSocialLinks {
  googleScholar?: string | null;
  linkedin?: string | null;
  researchGate?: string | null;
  orcid?: string | null;
  twitter?: string | null;
  github?: string | null;
}

/**
 * Parses contact section text into structured data
 */
export function parseContact(text: string): ParseResult<Contact> {
  const warnings: ParseWarning[] = [];

  const normalized = text
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s*Personal\s+Email)/gi, '$1\n')
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s*Official\s+Email)/gi, '$1\n');

  const contact: MutableContact = {
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
  
  // Extract emails
  const emails = extractEmails(normalized);
  if (emails.length > 0) {
    // Try to identify official vs personal email
    const officialEmail = emails.find(e => 
      e.includes('.edu') || e.includes('.ac.') || e.includes('sejong') || e.includes('inha')
    );
    const personalEmail = emails.find(e => 
      e.includes('gmail') || e.includes('yahoo') || e.includes('hotmail')
    );
    
    contact.email = officialEmail || emails[0] || null;
    if (personalEmail && personalEmail !== contact.email) {
      contact.personalEmail = personalEmail;
    }
  } else {
    warnings.push(createWarning('contact', 'No email address found', 'info'));
  }
  
  // Extract phone numbers
  const phones = extractPhoneNumbers(text);
  if (phones.length > 0) {
    // Try to categorize phone numbers
    const telMatch = normalized.match(/Tel[:\s|]+([^\n]+)/i);
    const faxMatch = normalized.match(/Fax[:\s|]+([^\n]+)/i);
    const cellMatch = normalized.match(/Cell(?:\s*Phone)?[:\s|]+([^\n]+)/i);
    
    if (telMatch) {
      const telPhone = extractPhoneNumbers(telMatch[1] ?? '')[0];
      if (telPhone) {
        contact.phone = telPhone;
      }
    }
    
    if (faxMatch) {
      const faxPhone = extractPhoneNumbers(faxMatch[1] ?? '')[0];
      if (faxPhone) {
        contact.fax = faxPhone;
      }
    }
    
    if (cellMatch) {
      const cellPhoneNum = extractPhoneNumbers(cellMatch[1] ?? '')[0];
      if (cellPhoneNum) {
        contact.cellPhone = cellPhoneNum;
      }
    }
    
    // Fallback to first phone if no specific match
    if (!contact.phone && phones.length > 0) {
      contact.phone = phones[0] || null;
    }
  }
  
  // Extract URLs
  const urls = extractUrls(normalized);
  
  // Categorize URLs
  for (const url of urls) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('linkedin')) {
      contact.social.linkedin = url;
    } else if (lowerUrl.includes('scholar.google') || lowerUrl.includes('google scholar')) {
      contact.social.googleScholar = url;
    } else if (lowerUrl.includes('researchgate')) {
      contact.social.researchGate = url;
    } else if (lowerUrl.includes('orcid')) {
      contact.social.orcid = url;
    } else if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) {
      contact.social.twitter = url;
    } else if (lowerUrl.includes('github')) {
      contact.social.github = url;
    } else if (!contact.website && (
      lowerUrl.includes('sadeghi') || 
      lowerUrl.includes('niaraki') ||
      lowerUrl.includes('.com') ||
      lowerUrl.includes('.ac.')
    )) {
      contact.website = url;
    }
  }
  
  // Extract website from text patterns
  if (!contact.website) {
    const websiteMatch = normalized.match(/Website[:\s|]+([^\s\n]+)/i);
    if (websiteMatch && websiteMatch[1]) {
      let website = websiteMatch[1];
      if (!website.startsWith('http')) {
        website = `https://${website}`;
      }
      contact.website = website;
    }
  }
  
  // Extract LinkedIn from text pattern
  if (!contact.social.linkedin) {
    const linkedinMatch = normalized.match(/LinkedIn[:\s|]+([^\s\n]+)/i);
    if (linkedinMatch && linkedinMatch[1]) {
      const rawLi = linkedinMatch[1].trim();
      if (/^https?:\/\//i.test(rawLi)) {
        contact.social.linkedin = rawLi;
      } else if (/linkedin\.com/i.test(rawLi)) {
        contact.social.linkedin = `https://${rawLi.replace(/^\/+/, '')}`;
      } else {
        contact.social.linkedin = `https://www.linkedin.com/in/${rawLi.replace(/^\/+/, '')}`;
      }
    }
  }
  
  // Extract address
  const addressPatterns = [
    /(?:Address|Location)[:\s]+([^\n]+(?:\n[^\n]+)?)/i,
    /(\d+[-\s]+[A-Za-z]+[^\n]*,\s*[A-Za-z]+[^\n]*(?:,\s*(?:Republic of\s+)?[A-Za-z]+)?)/,
  ];
  
  for (const pattern of addressPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      contact.address = match[1].trim();
      break;
    }
  }
  
  // Extract department
  const deptMatch = normalized.match(/Dept\.?\s*(?:of)?\s*([^\n,]+)/i);
  if (deptMatch && deptMatch[1]) {
    contact.department = deptMatch[1].trim();
  }
  
  // Extract university
  const uniMatch = normalized.match(/(?:Sejong|INHA|University|KNTU)[^\n,]*/i);
  if (uniMatch) {
    contact.university = uniMatch[0].trim();
  }
  
  return { data: contact as Contact, warnings };
}
