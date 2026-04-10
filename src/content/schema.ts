/**
 * Zod schemas for public site content (SiteContent).
 * Separate from src/validators/detailsSchema.ts (admin/parser details.json).
 */

import { z } from 'zod';

const lucideIconName = z.enum([
  'GraduationCap',
  'Linkedin',
  'BriefcaseBusiness',
  'Github',
  'Handshake',
  'Mail',
  'Phone',
  'MapPin',
  'Globe',
  'Building',
]);

const researchInterestIconName = z.enum(['Lightbulb', 'Microscope', 'FolderGit2']);

export const SiteMetaSchema = z.object({
  metadataBase: z.string().url(),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.string().min(1),
  authorName: z.string().min(1),
  creator: z.string().min(1),
  publisher: z.string().min(1),
  openGraphTitle: z.string().min(1),
  openGraphDescription: z.string().min(1),
  openGraphUrl: z.string().url(),
  openGraphSiteName: z.string().min(1),
  twitterTitle: z.string().min(1),
  twitterDescription: z.string().min(1),
  appleWebAppTitle: z.string().min(1),
});

export const ProfileSchema = z.object({
  displayName: z.string().min(1),
  roleLine: z.string().min(1),
  photoSrc: z.string().min(1),
  photoAlt: z.string().min(1),
  homeAboutIntro: z.string().min(1),
  aboutIntroTagline: z.string().min(1),
  aboutSkillTags: z.array(z.string()).min(1),
});

export const CareerStatsSchema = z.object({
  publications: z.number().int().nonnegative(),
  studentsSupervised: z.number().int().nonnegative(),
  countriesCollaborated: z.number().int().nonnegative(),
  /** External Master's / Ph.D. thesis examinations (CV: 100+). */
  thesesExamined: z.number().int().nonnegative(),
  yearsExperience: z.number().int().nonnegative(),
  projectsCompleted: z.number().int().nonnegative(),
});

export const AboutJourneyItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  institution: z.string().min(1),
  year: z.string().min(1),
  details: z.string().min(1),
});

export const AboutExperienceItemSchema = z.object({
  id: z.string().min(1),
  position: z.string().min(1),
  institution: z.string().min(1),
  duration: z.string().min(1),
  details: z.string().min(1),
  achievements: z.array(z.string()),
  projects: z.array(z.string()),
  type: z.enum(['academic', 'research', 'consulting']),
});

export const AboutAwardItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  year: z.string().min(1),
  details: z.string().min(1),
  impact: z.string().min(1),
  category: z.enum(['research', 'teaching', 'service']),
});

export const AboutPageCopySchema = z.object({
  collaborationHeading: z.string().min(1),
  collaborationBody: z.string().min(1),
  professionalSummaryParagraphs: z.array(z.string()).min(1),
});

export const AboutSectionSchema = z.object({
  journey: z.array(AboutJourneyItemSchema),
  experiences: z.array(AboutExperienceItemSchema),
  awards: z.array(AboutAwardItemSchema),
  stats: CareerStatsSchema,
  page: AboutPageCopySchema,
});

export const HomeHeroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  body: z.string().min(1),
});

export const HomeResearchCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().min(1),
  iconName: z.enum(['Github', 'Linkedin', 'Handshake']),
});

export const HomeSocialLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  ariaLabel: z.string().min(1),
  iconName: lucideIconName,
});

export const HomeSectionSchema = z.object({
  hero: HomeHeroSchema,
  aboutSectionHeading: z.string().min(1),
  aboutSectionIntro: z.string().min(1),
  researchInActionCaption: z.string().min(1),
  researchCards: z.array(HomeResearchCardSchema).min(1),
  socialLinks: z.array(HomeSocialLinkSchema).min(1),
});

export const ResearchInterestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()),
  iconName: researchInterestIconName,
});

export const ResearchProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  period: z.string().min(1),
  funding: z.string().min(1),
  amount: z.string().min(1),
  status: z.enum(['ongoing', 'completed']),
  role: z.string().min(1),
});

export const ResearchPageSchema = z.object({
  heroIntro: z.string().min(1),
  collaborationHeading: z.string().min(1),
  collaborationBody: z.string().min(1),
  interests: z.array(ResearchInterestSchema),
  projects: z.array(ResearchProjectSchema),
});

export const PublicationItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authors: z.string().min(1),
  journal: z.string().min(1),
  year: z.number().int(),
  type: z.enum(['journal', 'conference', 'book']),
  impactFactor: z.string().optional(),
  quartile: z.string().optional(),
  doi: z.string().optional(),
});

export const PublicationStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  journals: z.number().int().nonnegative(),
  conferences: z.number().int().nonnegative(),
  books: z.number().int().nonnegative(),
  /** Ph.D. dissertations directed to completion (CV: 6+). */
  phdAdvised: z.number().int().nonnegative(),
});

export const PublicationsPageSchema = z.object({
  heroIntro: z.string().min(1),
  scholarUrl: z.string().url(),
  stats: PublicationStatsSchema,
  items: z.array(PublicationItemSchema),
});

export const PatentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  number: z.string().min(1),
  country: z.string().min(1),
  date: z.string().min(1),
  inventors: z.string().min(1),
  status: z.enum(['registered', 'pending']),
  type: z.enum(['international', 'korean']),
});

export const PatentStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  international: z.number().int().nonnegative(),
  korean: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});

export const PatentsPageSchema = z.object({
  heroIntro: z.string().min(1),
  licensingHeading: z.string().min(1),
  licensingBody: z.string().min(1),
  stats: PatentStatsSchema,
  items: z.array(PatentItemSchema),
});

export const ContactInfoSchema = z.object({
  email: z.string().min(1),
  personalEmail: z.string().min(1),
  phone: z.string().min(1),
  fax: z.string().min(1),
  cellPhone: z.string().min(1),
  address: z.string().min(1),
  department: z.string().min(1),
  university: z.string().min(1),
  /** Host or path segment shown in UI; page may prefix https:// */
  websiteDisplay: z.string().min(1),
});

export const ContactSocialLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  iconName: z.enum(['GraduationCap', 'Linkedin', 'Building']),
  colorClass: z.string().min(1),
});

export const ContactPageSchema = z.object({
  heroHeading: z.string().min(1),
  heroSubtext: z.string().min(1),
  mapPlaceLabel: z.string().min(1),
  mapQueryUrl: z.string().url(),
  info: ContactInfoSchema,
  socialLinks: z.array(ContactSocialLinkSchema),
});

export const SimpleListItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const LayoutFooterSchema = z.object({
  aboutHeading: z.string().min(1),
  aboutBlurb: z.string().min(1),
  quickLinks: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) })),
  socialLinks: z.array(
    z.object({
      href: z.string().min(1),
      label: z.string().min(1),
      icon: z.string().min(1),
    }),
  ),
  copyrightName: z.string().min(1),
});

export const LayoutSchema = z.object({
  footer: LayoutFooterSchema,
});

export const SiteContentSchema = z.object({
  meta: SiteMetaSchema,
  profile: ProfileSchema,
  about: AboutSectionSchema,
  home: HomeSectionSchema,
  research: ResearchPageSchema,
  publications: PublicationsPageSchema,
  patents: PatentsPageSchema,
  contact: ContactPageSchema,
  teaching: z.array(SimpleListItemSchema),
  supervision: z.array(SimpleListItemSchema),
  service: z.array(SimpleListItemSchema),
  layout: LayoutSchema,
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type AboutJourneyItem = z.infer<typeof AboutJourneyItemSchema>;
export type AboutExperienceItem = z.infer<typeof AboutExperienceItemSchema>;
export type AboutAwardItem = z.infer<typeof AboutAwardItemSchema>;
export type PublicationItem = z.infer<typeof PublicationItemSchema>;
export type PatentItem = z.infer<typeof PatentItemSchema>;
