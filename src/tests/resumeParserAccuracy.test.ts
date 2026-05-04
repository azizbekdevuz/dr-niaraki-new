/**
 * Regression tests against the real bundled CV (`docs/resume.docx`).
 * Skips automatically when the file is missing (e.g. CI without docs).
 */

import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { parseDocxToDetails } from '@/parser/docxParser';

const RESUME = path.join(process.cwd(), 'docs', 'resume.docx');
const hasResume = fs.existsSync(RESUME);

describe('resume.docx parser accuracy', () => {
  (hasResume ? it : it.skip)(
    'parses patents and publications at scale',
    async () => {
      const buf = fs.readFileSync(RESUME);
      const { data, warnings } = await parseDocxToDetails(buf, 'resume.docx', 'test');

      expect(data.patents.length).toBeGreaterThanOrEqual(32);
      expect(data.publications.length).toBeGreaterThanOrEqual(60);
      expect(data.about.education.length).toBeGreaterThanOrEqual(2);
      expect(data.about.education.length).toBeLessThanOrEqual(14);
      expect(data.contact.email).toMatch(/@/);
      expect(data.contact.social.linkedin).toMatch(/^https:\/\//i);

      const unknownNoise = warnings.filter((w) => w.message.includes('eXtended Reality'));
      expect(unknownNoise.length).toBe(0);
    },
    25_000,
  );
});
