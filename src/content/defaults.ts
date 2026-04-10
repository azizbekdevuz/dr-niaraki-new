/**
 * Canonical default site content (matches pre-refactor public UI copy and lists).
 *
 * Runtime shape is asserted via TypeScript. Zod validation runs in tests (`siteContent.test.ts`)
 * so client bundles do not pay for `SiteContentSchema.safeParse` on every import.
 */

import type { SiteContent } from './schema';
import { aboutSeed } from './seed/about';
import { contactSeed } from './seed/contact';
import { homeSeed } from './seed/home';
import { layoutSeed } from './seed/layout';
import { metaSeed } from './seed/meta';
import { patentsSeed } from './seed/patents';
import { profileSeed } from './seed/profile';
import { publicationsSeed } from './seed/publications';
import { researchSeed } from './seed/research';

/** Raw merged object; exported for Vitest + any future build-time validators. */
export const SITE_CONTENT_RAW = {
  meta: metaSeed,
  profile: profileSeed,
  about: aboutSeed,
  home: homeSeed,
  research: researchSeed,
  publications: publicationsSeed,
  patents: patentsSeed,
  contact: contactSeed,
  teaching: [],
  supervision: [],
  service: [],
  layout: layoutSeed,
} as const;

export const siteContent: SiteContent = SITE_CONTENT_RAW as unknown as SiteContent;
