/**
 * TypeScript types for the canonical details.json schema
 * Used across the application for professor profile data
 */

export interface ProfileMeta {
  readonly lastUpdated?: string;
  readonly source?: string;
}

export interface Profile {
  readonly name: string;
  readonly title?: string | null;
  readonly photoUrl?: string | null;
  readonly summary?: string | null;
  readonly meta?: ProfileMeta | null;
}

export interface Education {
  readonly id: string;
  readonly degree: string;
  readonly institution: string;
  readonly location?: string | null;
  readonly year?: string | null;
  readonly period?: string | null;
  readonly thesis?: string | null;
  readonly supervisor?: string | null;
  readonly details?: string | null;
  readonly raw?: string | null;
}

export interface Position {
  readonly id: string;
  readonly title: string;
  readonly institution: string;
  readonly location?: string | null;
  readonly period: string;
  readonly type: 'academic' | 'research' | 'consulting' | 'industry' | 'other';
  readonly details?: string | null;
  readonly achievements?: readonly string[];
  readonly raw?: string | null;
}

export interface Award {
  readonly id: string;
  readonly title: string;
  readonly organization?: string | null;
  readonly year?: string | null;
  readonly category?: 'research' | 'teaching' | 'service' | 'other' | null;
  readonly details?: string | null;
  readonly raw?: string | null;
}

export interface Language {
  readonly name: string;
  readonly proficiency?: string | null;
}

export interface About {
  readonly brief?: string | null;
  readonly full?: string | null;
  readonly education: readonly Education[];
  readonly positions: readonly Position[];
  readonly awards: readonly Award[];
  readonly languages: readonly Language[];
}

export interface ResearchInterest {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly keywords?: readonly string[];
}

export interface ResearchProject {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly period?: string | null;
  readonly funding?: string | null;
  readonly fundingAmount?: string | null;
  readonly role?: string | null;
  readonly status?: 'ongoing' | 'completed' | 'planned' | null;
  readonly raw?: string | null;
}

export interface Grant {
  readonly id: string;
  readonly title: string;
  readonly fundingAgency?: string | null;
  readonly amount?: string | null;
  readonly period?: string | null;
  readonly role?: string | null;
  readonly raw?: string | null;
}

export interface Research {
  readonly interests: readonly ResearchInterest[];
  readonly projects: readonly ResearchProject[];
  readonly grants: readonly Grant[];
}

export interface Publication {
  readonly id: string;
  readonly title: string;
  readonly authors?: string | null;
  readonly journal?: string | null;
  readonly year?: number | null;
  readonly volume?: string | null;
  readonly issue?: string | null;
  readonly pages?: string | null;
  readonly doi?: string | null;
  readonly link?: string | null;
  readonly type?: 'journal' | 'conference' | 'book' | 'chapter' | 'other' | null;
  readonly impactFactor?: string | null;
  readonly quartile?: string | null;
  readonly raw?: string | null;
}

export interface Patent {
  readonly id: string;
  readonly title: string;
  readonly inventors?: string | null;
  readonly number?: string | null;
  readonly country?: string | null;
  readonly date?: string | null;
  readonly status?: 'registered' | 'pending' | 'completed' | 'expired' | null;
  readonly type?: 'international' | 'korean' | 'other' | null;
  readonly link?: string | null;
  readonly raw?: string | null;
}

export interface SocialLinks {
  readonly googleScholar?: string | null;
  readonly linkedin?: string | null;
  readonly researchGate?: string | null;
  readonly orcid?: string | null;
  readonly twitter?: string | null;
  readonly github?: string | null;
}

export interface Contact {
  readonly email?: string | null;
  readonly personalEmail?: string | null;
  readonly phone?: string | null;
  readonly fax?: string | null;
  readonly cellPhone?: string | null;
  readonly address?: string | null;
  readonly department?: string | null;
  readonly university?: string | null;
  readonly website?: string | null;
  readonly cvUrl?: string | null;
  readonly social: SocialLinks;
}

export interface UploadMetadata {
  readonly filename: string;
  readonly originalName: string;
  readonly uploadedAt: string;
  readonly uploader?: string | null;
  readonly fileSizeBytes: number;
  readonly sha256: string;
  readonly warnings: readonly string[];
}

export interface DetailsMeta {
  readonly sourceFileName: string;
  readonly parsedAt: string;
  readonly parserVersion: string;
  readonly commitSha?: string | null;
  readonly uploader?: string | null;
  readonly warnings: readonly string[];
  readonly uploads?: readonly UploadMetadata[];
}

export interface Counts {
  readonly publications: number;
  readonly patents: number;
  readonly projects: number;
  readonly awards: number;
  readonly students?: number;
}

export interface Details {
  readonly profile: Profile;
  readonly about: About;
  readonly research: Research;
  readonly publications: readonly Publication[];
  readonly patents: readonly Patent[];
  readonly contact: Contact;
  readonly rawHtml?: string | null;
  readonly counts: Counts;
  readonly meta: DetailsMeta;
}

// Mutable versions for building during parsing
export type MutablePublication = {
  -readonly [K in keyof Publication]: Publication[K];
};

export type MutablePatent = {
  -readonly [K in keyof Patent]: Patent[K];
};

export type MutableEducation = {
  -readonly [K in keyof Education]: Education[K];
};

export type MutablePosition = {
  -readonly [K in keyof Position]: Position[K];
};

export type MutableAward = {
  -readonly [K in keyof Award]: Award[K];
};

export type MutableGrant = {
  -readonly [K in keyof Grant]: Grant[K];
};

export type MutableResearchProject = {
  -readonly [K in keyof ResearchProject]: ResearchProject[K];
};

