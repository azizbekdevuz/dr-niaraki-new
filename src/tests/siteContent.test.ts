import { describe, expect, it } from 'vitest';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { SiteContentSchema } from '@/content/schema';

describe('SITE_CONTENT_RAW', () => {
  it('matches SiteContentSchema (regression guard for public content layer)', () => {
    const parsed = SiteContentSchema.safeParse(SITE_CONTENT_RAW);
    expect(parsed.success, JSON.stringify(parsed.success ? '' : parsed.error.flatten())).toBe(
      true,
    );
  });
});
