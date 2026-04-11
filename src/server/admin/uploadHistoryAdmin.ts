import 'server-only';

import type { ContentImport, ImportStatus, UploadedFile } from '@prisma/client';

import { deleteUpload, getUploadHistory } from '@/lib/storage';
import {
  filenameFromStoredPath,
  importWarningsToDisplayStrings,
  manifestRowIsRedundantWithPrismaMerge,
  PRISMA_UPLOAD_HISTORY_MAX_TAKE,
  resolvePrismaUploadHistoryTake,
} from '@/server/admin/uploadHistoryAdminUtils';
import { prisma } from '@/server/db/prisma';
import { deleteResumeBlobIfStored, pathnameFromResumeStoredPath } from '@/server/storage/resumeBlobStorage';
import type { UploadHistoryItem } from '@/types/admin';

const IMPORT_STATUSES_SAFE_FOR_FILE_DELETE: ReadonlySet<ImportStatus> = new Set([
  'UPLOADED',
  'FAILED',
  'REJECTED',
]);

type UploadedFileWithLatestImport = UploadedFile & {
  imports: ContentImport[];
};

function mapPrismaRowToHistoryItem(row: UploadedFileWithLatestImport): UploadHistoryItem {
  const filename = filenameFromStoredPath(row.storedPath);
  const latest = row.imports[0];
  const warnings = latest ? importWarningsToDisplayStrings(latest.warnings) : [];
  let downloadUrl = `/uploads/${filename}`;
  if (pathnameFromResumeStoredPath(row.storedPath)) {
    downloadUrl = `/api/admin/uploaded-files/${row.id}/file`;
  } else if (row.storedPath.startsWith('/')) {
    downloadUrl = row.storedPath;
  }
  return {
    filename,
    originalName: row.originalName,
    uploadedAt: row.uploadedAt.toISOString(),
    fileSizeBytes: row.sizeBytes,
    sha256: row.sha256,
    warnings,
    downloadUrl,
    prismaUploadedFileId: row.id,
    contentImportId: latest?.id,
    recordSource: 'prisma',
    importStatus: latest?.status,
  };
}

function importSafeToDeleteWithFile(imp: ContentImport & { versions: { id: string }[] }): boolean {
  return IMPORT_STATUSES_SAFE_FOR_FILE_DELETE.has(imp.status) && imp.versions.length === 0;
}

export type MergedUploadHistoryResult = {
  uploads: UploadHistoryItem[];
  listingSource: 'prisma_primary_merged_legacy_manifest' | 'legacy_manifest_fallback_db_unavailable';
  authorityNote: string;
  prismaBackedCount: number;
  legacyManifestOnlyCount: number;
  historyPrismaTakeLimit: number;
  historyPrismaTakeMax: number;
};

const AUTHORITY_NOTE = `Primary rows come from Prisma \`UploadedFile\` / \`ContentImport\` (newest first, limit from ADMIN_UPLOAD_HISTORY_PRISMA_TAKE, max ${PRISMA_UPLOAD_HISTORY_MAX_TAKE}). Legacy \`uploads_meta.json\` rows are appended only when they are not already linked (same filename, or same prismaUploadedFileId / contentImportId when those fields exist on the manifest row).`;

export async function listMergedUploadHistoryForAdmin(): Promise<MergedUploadHistoryResult> {
  const take = resolvePrismaUploadHistoryTake();
  let prismaRows: UploadedFileWithLatestImport[] = [];
  try {
    prismaRows = await prisma.uploadedFile.findMany({
      take,
      orderBy: { uploadedAt: 'desc' },
      include: {
        imports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  } catch (e) {
    console.warn('[uploadHistoryAdmin] Prisma list failed; falling back to legacy manifest only.', e);
    const legacyOnly = await getUploadHistory();
    return {
      uploads: legacyOnly.map((u) => ({ ...u, recordSource: 'legacy_manifest_only' as const })),
      listingSource: 'legacy_manifest_fallback_db_unavailable',
      authorityNote:
        'Database unavailable — this list is legacy `uploads_meta.json` only. Prisma-backed imports may be missing.',
      prismaBackedCount: 0,
      legacyManifestOnlyCount: legacyOnly.length,
      historyPrismaTakeLimit: take,
      historyPrismaTakeMax: PRISMA_UPLOAD_HISTORY_MAX_TAKE,
    };
  }

  const prismaItems = prismaRows.map(mapPrismaRowToHistoryItem);
  const prismaFilenames = new Set(prismaItems.map((p) => p.filename));
  const prismaUploadedFileIds = new Set(
    prismaItems.map((p) => p.prismaUploadedFileId).filter((id): id is string => Boolean(id))
  );
  const prismaContentImportIds = new Set(
    prismaItems.map((p) => p.contentImportId).filter((id): id is string => Boolean(id))
  );

  const manifest = await getUploadHistory();
  const legacyExtras: UploadHistoryItem[] = manifest
    .filter(
      (m) =>
        !manifestRowIsRedundantWithPrismaMerge(
          m,
          prismaFilenames,
          prismaUploadedFileIds,
          prismaContentImportIds
        )
    )
    .map((m) => ({
      ...m,
      recordSource: 'legacy_manifest_only' as const,
    }));

  legacyExtras.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return {
    uploads: [...prismaItems, ...legacyExtras],
    listingSource: 'prisma_primary_merged_legacy_manifest',
    authorityNote: AUTHORITY_NOTE,
    prismaBackedCount: prismaItems.length,
    legacyManifestOnlyCount: legacyExtras.length,
    historyPrismaTakeLimit: take,
    historyPrismaTakeMax: PRISMA_UPLOAD_HISTORY_MAX_TAKE,
  };
}

export type AdminUploadDeleteOutcome = {
  prismaDeletion: 'deleted' | 'skipped' | 'absent';
  legacyManifestRemoved: boolean;
  message: string;
};

export async function deleteUploadAdminByFilename(filename: string): Promise<AdminUploadDeleteOutcome> {
  let prismaDeletion: 'deleted' | 'skipped' | 'absent' = 'absent';

  try {
    const file = await prisma.uploadedFile.findFirst({
      where: {
        OR: [{ storedPath: { endsWith: `/${filename}` } }, { storedPath: filename }],
      },
      include: {
        imports: {
          include: { versions: { select: { id: true } } },
        },
      },
    });

    if (file) {
      const storedPathForBlob = file.storedPath;
      if (file.imports.length === 0) {
        await prisma.uploadedFile.delete({ where: { id: file.id } });
        await deleteResumeBlobIfStored(storedPathForBlob);
        prismaDeletion = 'deleted';
      } else {
        const allSafe = file.imports.every(importSafeToDeleteWithFile);
        if (allSafe) {
          await prisma.uploadedFile.delete({ where: { id: file.id } });
          await deleteResumeBlobIfStored(storedPathForBlob);
          prismaDeletion = 'deleted';
        } else {
          prismaDeletion = 'skipped';
        }
      }
    }
  } catch (e) {
    console.warn('[uploadHistoryAdmin] Prisma delete lookup failed; continuing with legacy manifest only.', e);
    prismaDeletion = 'absent';
  }

  const legacyManifestRemoved = await deleteUpload(filename);

  let message = 'Removed from upload history.';
  if (prismaDeletion === 'deleted') {
    message = 'Removed database record, legacy manifest row (if any), and local file when present.';
  } else if (prismaDeletion === 'skipped') {
    message =
      'Import has progressed beyond a safe automatic DB delete (e.g. review/merge activity). Removed legacy manifest row and local file when present; Prisma `UploadedFile` / `ContentImport` kept.';
  } else if (legacyManifestRemoved) {
    message = 'Removed legacy manifest entry and local file when present (no matching Prisma upload).';
  }

  return { prismaDeletion, legacyManifestRemoved, message };
}
