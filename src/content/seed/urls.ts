/**
 * Shared external URLs used across public seeds (single source; avoids silent drift).
 */

export const EXTERNAL_URLS = {
  googleScholar:
    'https://scholar.google.com/citations?user=-V8_A5YAAAAJ&hl=en',
  /** CV / public profile path (single canonical link across site). */
  linkedinProfile: 'https://www.linkedin.com/in/abolghasemsadeghi-n',
  sejongPure:
    'https://sejong.elsevierpure.com/en/persons/sadeghi-niaraki-abolghasem',
  mailtoWork: 'mailto:a.sadeghi@sejong.ac.kr',
} as const;
