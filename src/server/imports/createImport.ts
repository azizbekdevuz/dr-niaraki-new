import 'server-only';

import { prisma } from '@/server/db/prisma';
import type { CreateUploadedFileInput } from '@/server/imports/repository';
import { createContentImportRecord } from '@/server/imports/repository';

/**
 * Store raw upload + initial import row in one transaction.
 * Parser phases attach `rawExtract` / `candidatePayload` later — never writes canonical draft here.
 */
export async function createUploadedFileAndImport(input: CreateUploadedFileInput) {
  return prisma.$transaction(async (tx) => {
    const uploaded = await tx.uploadedFile.create({ data: input });
    const imp = await tx.contentImport.create({
      data: { uploadedFileId: uploaded.id, status: 'UPLOADED' },
    });
    return { uploadedFile: uploaded, import: imp };
  });
}

export async function createImportForExistingUpload(uploadedFileId: string) {
  return createContentImportRecord(uploadedFileId);
}
