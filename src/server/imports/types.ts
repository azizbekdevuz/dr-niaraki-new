import type { ImportStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

/** Single warning shown in admin / future review UI; stored on `ContentImport.warnings` as JSON. */
export const importWarningItemSchema = z.object({
  message: z.string().min(1),
  code: z.string().optional(),
  path: z.string().optional(),
});

export type ImportWarningItem = z.infer<typeof importWarningItemSchema>;

/** Parser / normalizer output before mapping to site content — not canonical draft. */
export type RawExtractResult = Prisma.InputJsonValue;

/** Parsed candidate for a later review/merge phase — never live `SiteContent` until explicitly merged. */
export type CandidateParsedPayload = Prisma.InputJsonValue;

export type ImportSummaryDto = {
  id: string;
  uploadedFileId: string;
  status: ImportStatus;
  parserVersion: string | null;
  originalFileName: string;
  createdAt: string;
  updatedAt: string;
};

export type ImportCandidateSummaryDto = {
  profileName: string | null;
  publicationCount: number;
  patentCount: number;
  rawHtmlTruncated: boolean;
};

export type ImportDetailDto = ImportSummaryDto & {
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  sourceFormat: string;
  rawPreviewPath: string | null;
  rawExtract: Prisma.JsonValue | null;
  candidatePayload: Prisma.JsonValue | null;
  candidateSummary: ImportCandidateSummaryDto | null;
  warnings: ImportWarningItem[];
  linkedVersionIds: string[];
};

export class ImportDomainError extends Error {
  constructor(
    readonly code: 'UPLOADED_FILE_NOT_FOUND' | 'IMPORT_NOT_FOUND',
    message: string,
  ) {
    super(message);
    this.name = 'ImportDomainError';
  }
}
