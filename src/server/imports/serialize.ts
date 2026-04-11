import 'server-only';

import type { ContentImport, UploadedFile } from '@prisma/client';

import {
  importWarningItemSchema,
  type ImportCandidateSummaryDto,
  type ImportDetailDto,
  type ImportSummaryDto,
  type ImportWarningItem,
} from '@/server/imports/types';

export function parseImportWarnings(input: unknown): ImportWarningItem[] {
  const parsed = importWarningItemSchema.array().safeParse(input);
  return parsed.success ? parsed.data : [];
}

type ImportWithFile = ContentImport & { uploadedFile: UploadedFile };

type ImportWithFileAndVersions = ImportWithFile & {
  versions: { id: string }[];
};

export function toImportSummary(row: ImportWithFile): ImportSummaryDto {
  return {
    id: row.id,
    uploadedFileId: row.uploadedFileId,
    status: row.status,
    parserVersion: row.parserVersion,
    originalFileName: row.uploadedFile.originalName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function buildImportCandidateSummary(payload: unknown): ImportCandidateSummaryDto | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const p = payload as Record<string, unknown>;
  const profile = p.profile as Record<string, unknown> | undefined;
  const pubs = p.publications as unknown[] | undefined;
  const pats = p.patents as unknown[] | undefined;
  return {
    profileName: typeof profile?.name === 'string' ? profile.name : null,
    publicationCount: Array.isArray(pubs) ? pubs.length : 0,
    patentCount: Array.isArray(pats) ? pats.length : 0,
    rawHtmlTruncated: p.rawHtmlTruncated === true,
  };
}

export function toImportDetail(row: ImportWithFileAndVersions): ImportDetailDto {
  const summary = toImportSummary(row);
  return {
    ...summary,
    mimeType: row.uploadedFile.mimeType,
    sizeBytes: row.uploadedFile.sizeBytes,
    sha256: row.uploadedFile.sha256,
    sourceFormat: row.uploadedFile.sourceFormat,
    rawPreviewPath: row.rawPreviewPath,
    rawExtract: row.rawExtract,
    candidatePayload: row.candidatePayload,
    candidateSummary: buildImportCandidateSummary(row.candidatePayload),
    warnings: parseImportWarnings(row.warnings),
    linkedVersionIds: row.versions.map((v: { id: string }) => v.id),
  };
}
