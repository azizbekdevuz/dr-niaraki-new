import type { SiteContent } from '@/content/schema';
import type { DetailsSchemaType } from '@/validators/detailsSchema';

/** Aligns parsed research interest names/descriptions into existing site interest rows (paired by index). */
export function mergeResearchInterestsFromDetails(details: DetailsSchemaType, next: SiteContent): void {
  const candInterests = details.research.interests;
  const baseInterests = [...next.research.interests];
  const nInt = Math.min(candInterests.length, baseInterests.length);
  for (let i = 0; i < nInt; i += 1) {
    const d = candInterests[i]!;
    const row = baseInterests[i]!;
    baseInterests[i] = {
      ...row,
      name: d.name.trim(),
      description: (d.description?.trim() || row.description).trim(),
      keywords: d.keywords && d.keywords.length > 0 ? [...d.keywords] : [...row.keywords],
    };
  }
  next.research.interests = baseInterests;
}
