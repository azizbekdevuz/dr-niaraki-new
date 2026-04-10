import type { ZodError } from 'zod';

import { SiteContentSchema, type SiteContent } from './schema';

export type SiteContentValidationResult =
  | { success: true; data: SiteContent }
  | { success: false; error: ZodError };

export function validateSiteContent(data: unknown): SiteContentValidationResult {
  const result = SiteContentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function assertSiteContent(data: unknown): SiteContent {
  const result = validateSiteContent(data);
  if (!result.success) {
    throw new Error(
      `SiteContent validation failed: ${JSON.stringify(result.error.flatten(), null, 2)}`,
    );
  }
  return result.data;
}
