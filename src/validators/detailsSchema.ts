/**
 * Zod schema for canonical details.json validation
 * Ensures all required keys exist with proper types
 */

import { z } from 'zod';

// Profile schema
export const ProfileMetaSchema = z.object({
  lastUpdated: z.string().optional(),
  source: z.string().optional(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  title: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  meta: ProfileMetaSchema.nullable().optional(),
});

// Education schema
export const EducationSchema = z.object({
  id: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  thesis: z.string().nullable().optional(),
  supervisor: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Position schema
export const PositionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().nullable().optional(),
  period: z.string().min(1),
  type: z.enum(['academic', 'research', 'consulting', 'industry', 'other']),
  details: z.string().nullable().optional(),
  achievements: z.array(z.string()).optional().default([]),
  raw: z.string().nullable().optional(),
});

// Award schema
export const AwardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
  category: z.enum(['research', 'teaching', 'service', 'other']).nullable().optional(),
  details: z.string().nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Language schema
export const LanguageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.string().nullable().optional(),
});

// About schema
export const AboutSchema = z.object({
  brief: z.string().nullable().optional(),
  full: z.string().nullable().optional(),
  education: z.array(EducationSchema).default([]),
  positions: z.array(PositionSchema).default([]),
  awards: z.array(AwardSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
});

// Research Interest schema
export const ResearchInterestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional().default([]),
});

// Research Project schema
export const ResearchProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  funding: z.string().nullable().optional(),
  fundingAmount: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  status: z.enum(['ongoing', 'completed', 'planned']).nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Grant schema
export const GrantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fundingAgency: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Research schema
export const ResearchSchema = z.object({
  interests: z.array(ResearchInterestSchema).default([]),
  projects: z.array(ResearchProjectSchema).default([]),
  grants: z.array(GrantSchema).default([]),
});

// Publication schema
export const PublicationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authors: z.string().nullable().optional(),
  journal: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  volume: z.string().nullable().optional(),
  issue: z.string().nullable().optional(),
  pages: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  type: z.enum(['journal', 'conference', 'book', 'chapter', 'other']).nullable().optional(),
  impactFactor: z.string().nullable().optional(),
  quartile: z.string().nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Patent schema
export const PatentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  inventors: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  status: z.enum(['registered', 'pending', 'completed', 'expired']).nullable().optional(),
  type: z.enum(['international', 'korean', 'other']).nullable().optional(),
  link: z.string().nullable().optional(),
  raw: z.string().nullable().optional(),
});

// Social Links schema
export const SocialLinksSchema = z.object({
  googleScholar: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  researchGate: z.string().nullable().optional(),
  orcid: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
});

// Contact schema
export const ContactSchema = z.object({
  email: z.string().email().nullable().optional(),
  personalEmail: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  cellPhone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  university: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  cvUrl: z.string().nullable().optional(),
  social: SocialLinksSchema.default({}),
});

// Upload Metadata schema
export const UploadMetadataSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  uploadedAt: z.string().datetime(),
  uploader: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().positive(),
  sha256: z.string().min(64).max(64),
  warnings: z.array(z.string()).default([]),
});

// Details Meta schema
export const DetailsMetaSchema = z.object({
  sourceFileName: z.string().min(1),
  parsedAt: z.string().datetime(),
  parserVersion: z.string().min(1),
  commitSha: z.string().nullable().optional(),
  uploader: z.string().nullable().optional(),
  warnings: z.array(z.string()).default([]),
  uploads: z.array(UploadMetadataSchema).optional(),
});

// Counts schema
export const CountsSchema = z.object({
  publications: z.number().int().nonnegative(),
  patents: z.number().int().nonnegative(),
  projects: z.number().int().nonnegative(),
  awards: z.number().int().nonnegative(),
  students: z.number().int().nonnegative().optional(),
});

// Main Details schema
export const DetailsSchema = z.object({
  profile: ProfileSchema,
  about: AboutSchema,
  research: ResearchSchema,
  publications: z.array(PublicationSchema).default([]),
  patents: z.array(PatentSchema).default([]),
  contact: ContactSchema,
  rawHtml: z.string().nullable().optional(),
  counts: CountsSchema,
  meta: DetailsMetaSchema,
});

// Export types inferred from schemas
export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
export type EducationSchemaType = z.infer<typeof EducationSchema>;
export type PositionSchemaType = z.infer<typeof PositionSchema>;
export type AwardSchemaType = z.infer<typeof AwardSchema>;
export type AboutSchemaType = z.infer<typeof AboutSchema>;
export type ResearchSchemaType = z.infer<typeof ResearchSchema>;
export type PublicationSchemaType = z.infer<typeof PublicationSchema>;
export type PatentSchemaType = z.infer<typeof PatentSchema>;
export type ContactSchemaType = z.infer<typeof ContactSchema>;
export type DetailsSchemaType = z.infer<typeof DetailsSchema>;

// Validation helper function
export function validateDetails(data: unknown): { 
  success: boolean; 
  data?: DetailsSchemaType; 
  errors?: z.ZodError['issues'];
} {
  const result = DetailsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

// Partial validation for preview stage
export const PartialDetailsSchema = DetailsSchema.partial();

export function validatePartialDetails(data: unknown): {
  success: boolean;
  data?: Partial<DetailsSchemaType>;
  errors?: z.ZodError['issues'];
} {
  const result = PartialDetailsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

