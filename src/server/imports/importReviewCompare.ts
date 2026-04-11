import 'server-only';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent, validateSiteContent } from '@/content/validators';
import { getWorkingDraft } from '@/server/content/contentWorkflowCore';
import { mergeCvDetailsIntoSiteContent } from '@/server/imports/detailsToSiteContentMerge';
import {
  buildStructuredReviewBlocks,
  LEGACY_UPLOADS_META_NOTE,
  type ImportReviewBlock,
  type ImportReviewProvenance,
} from '@/server/imports/importReviewStructured';
import { getContentImportDetail } from '@/server/imports/repository';
import { DetailsSchema } from '@/validators/detailsSchema';

export type { ImportReviewBlock } from '@/server/imports/importReviewStructured';

export type ImportReviewPayload = {
  baselineSource: 'working_draft' | 'canonical';
  blocks: ImportReviewBlock[];
  warnings: { message: string; code?: string }[];
  provenance: ImportReviewProvenance | null;
  legacyUploadsMetaNote: string;
};

/**
 * Builds structured review (added / removed / changed + scalar summaries) for the import admin UI.
 */
export async function buildImportReviewPayload(importId: string): Promise<ImportReviewPayload> {
  const row = await getContentImportDetail(importId);
  if (!row) {
    throw new Error('Import not found');
  }
  const warnings = Array.isArray(row.warnings)
    ? (row.warnings as { message: string; code?: string }[])
    : [];

  const working = await getWorkingDraft();
  const baselineSource = working ? 'working_draft' : 'canonical';
  const baselinePayload = working
    ? validateSiteContent(working.payload)
    : validateSiteContent(SITE_CONTENT_RAW);
  const baseline =
    baselinePayload.success && baselinePayload.data
      ? baselinePayload.data
      : assertSiteContent(SITE_CONTENT_RAW);

  const parsed = DetailsSchema.safeParse(row.candidatePayload);
  if (!parsed.success) {
    return {
      baselineSource,
      blocks: [
        {
          id: 'candidate',
          title: 'Candidate',
          unchangedSummary: null,
          added: [],
          removed: [],
          changed: [
            {
              label: 'Parse / storage',
              lines: ['Stored payload is not valid Details JSON — merge is blocked until the candidate is valid.'],
            },
          ],
        },
      ],
      warnings,
      provenance: {
        importId: row.id,
        originalFileName: row.uploadedFile.originalName,
        storedPath: row.uploadedFile.storedPath,
        uploadedFileId: row.uploadedFile.id,
      },
      legacyUploadsMetaNote: LEGACY_UPLOADS_META_NOTE,
    };
  }

  const mergedCandidate = mergeCvDetailsIntoSiteContent(parsed.data, baseline);
  const provenance: ImportReviewProvenance = {
    importId: row.id,
    originalFileName: row.uploadedFile.originalName,
    storedPath: row.uploadedFile.storedPath,
    uploadedFileId: row.uploadedFile.id,
  };
  const blocks = buildStructuredReviewBlocks(baseline, mergedCandidate, provenance);

  return {
    baselineSource,
    blocks,
    warnings,
    provenance,
    legacyUploadsMetaNote: LEGACY_UPLOADS_META_NOTE,
  };
}
