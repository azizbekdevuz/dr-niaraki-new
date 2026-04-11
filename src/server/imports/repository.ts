import 'server-only';

import { Prisma, type ImportStatus, type UploadSourceFormat } from '@prisma/client';

import { prisma } from '@/server/db/prisma';
import { ImportDomainError } from '@/server/imports/types';

export type CreateUploadedFileInput = {
  originalName: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  sourceFormat: UploadSourceFormat;
};

export async function createUploadedFileRecord(input: CreateUploadedFileInput) {
  return prisma.uploadedFile.create({ data: input });
}

export async function createContentImportRecord(uploadedFileId: string) {
  const file = await prisma.uploadedFile.findUnique({ where: { id: uploadedFileId } });
  if (!file) {
    throw new ImportDomainError('UPLOADED_FILE_NOT_FOUND', 'Uploaded file not found.');
  }
  return prisma.contentImport.create({
    data: { uploadedFileId, status: 'UPLOADED' },
  });
}

export async function updateImportStatus(importId: string, status: ImportStatus) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: { status },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

export async function saveImportRawExtract(importId: string, rawExtract: Prisma.InputJsonValue) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: { rawExtract },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

export async function saveImportParserMeta(importId: string, parserVersion: string | null, status: ImportStatus) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: { parserVersion, status },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

export async function saveImportCandidateAndWarnings(
  importId: string,
  input: { candidatePayload: Prisma.InputJsonValue; warnings: Prisma.InputJsonValue; status?: ImportStatus },
) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: {
        candidatePayload: input.candidatePayload,
        warnings: input.warnings,
        status: input.status ?? 'NEEDS_REVIEW',
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

/** Single write after a successful DOCX parse — keeps import-domain updates in one place. */
export async function persistImportParseOutcome(
  importId: string,
  input: {
    rawExtract: Prisma.InputJsonValue;
    candidatePayload: Prisma.InputJsonValue;
    warnings: Prisma.InputJsonValue;
    status: ImportStatus;
    parserVersion: string | null;
    rawPreviewPath?: string | null;
  },
) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: {
        rawExtract: input.rawExtract,
        candidatePayload: input.candidatePayload,
        warnings: input.warnings,
        status: input.status,
        parserVersion: input.parserVersion,
        ...(input.rawPreviewPath !== undefined ? { rawPreviewPath: input.rawPreviewPath } : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

export async function persistImportParseFailure(
  importId: string,
  input: { parserVersion: string | null; warnings: Prisma.InputJsonValue },
) {
  try {
    return await prisma.contentImport.update({
      where: { id: importId },
      data: {
        status: 'FAILED',
        parserVersion: input.parserVersion,
        warnings: input.warnings,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ImportDomainError('IMPORT_NOT_FOUND', 'Import not found.');
    }
    throw e;
  }
}

export async function listContentImportsForAdmin(take = 50) {
  return prisma.contentImport.findMany({
    take,
    orderBy: { createdAt: 'desc' },
    include: { uploadedFile: true },
  });
}

export async function getContentImportDetail(importId: string) {
  const row = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: {
      uploadedFile: true,
      versions: { select: { id: true } },
    },
  });
  if (!row) {
    return null;
  }
  return row;
}
