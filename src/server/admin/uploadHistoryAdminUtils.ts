/**
 * Pure helpers for admin upload history (no Prisma / no server-only gate).
 */

import { VERCEL_BLOB_STORED_PREFIX } from '@/lib/storagePathMarkers';

export type ManifestMergeRowRef = {
  filename: string;
  prismaUploadedFileId?: string;
  contentImportId?: string;
};

/**
 * Whether a legacy manifest row is already represented in the Prisma-backed merge set.
 * Uses filename, linked uploaded file id, and linked import id when present on the manifest row.
 */
export function manifestRowIsRedundantWithPrismaMerge(
  m: ManifestMergeRowRef,
  prismaFilenames: Set<string>,
  prismaUploadedFileIds: Set<string>,
  prismaContentImportIds: Set<string>
): boolean {
  if (prismaFilenames.has(m.filename)) {
    return true;
  }
  if (m.prismaUploadedFileId && prismaUploadedFileIds.has(m.prismaUploadedFileId)) {
    return true;
  }
  if (m.contentImportId && prismaContentImportIds.has(m.contentImportId)) {
    return true;
  }
  return false;
}

/** Default cap for Prisma-backed admin upload history (bounded for safety). */
export const PRISMA_UPLOAD_HISTORY_DEFAULT_TAKE = 100;
export const PRISMA_UPLOAD_HISTORY_MAX_TAKE = 500;

export function resolvePrismaUploadHistoryTake(): number {
  const raw = process.env.ADMIN_UPLOAD_HISTORY_PRISMA_TAKE?.trim();
  if (!raw) {
    return PRISMA_UPLOAD_HISTORY_DEFAULT_TAKE;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return PRISMA_UPLOAD_HISTORY_DEFAULT_TAKE;
  }
  return Math.min(n, PRISMA_UPLOAD_HISTORY_MAX_TAKE);
}

export function filenameFromStoredPath(storedPath: string): string {
  if (storedPath.startsWith(VERCEL_BLOB_STORED_PREFIX)) {
    const pathname = storedPath.slice(VERCEL_BLOB_STORED_PREFIX.length);
    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 ? (parts[parts.length - 1] as string) : storedPath;
  }
  const parts = storedPath.split('/').filter(Boolean);
  return parts.length > 0 ? (parts[parts.length - 1] as string) : storedPath;
}

export function importWarningsToDisplayStrings(warnings: unknown, max = 20): string[] {
  if (!Array.isArray(warnings)) {
    return [];
  }
  return warnings
    .slice(0, max)
    .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
}
