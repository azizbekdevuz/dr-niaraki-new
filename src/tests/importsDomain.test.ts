import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    uploadedFile: { findUnique: vi.fn(), create: vi.fn() },
    contentImport: { create: vi.fn(), update: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '@/server/db/prisma';
import { isTerminalImportStatus } from '@/server/imports/importStatus';
import {
  createContentImportRecord,
  saveImportCandidateAndWarnings,
  updateImportStatus,
} from '@/server/imports/repository';
import { parseImportWarnings, toImportDetail, toImportSummary } from '@/server/imports/serialize';
import { ImportDomainError } from '@/server/imports/types';

describe('importsDomain', () => {
  it('parseImportWarnings accepts a valid array and falls back for invalid shapes', () => {
    expect(parseImportWarnings([{ message: 'x' }])).toEqual([{ message: 'x' }]);
    expect(parseImportWarnings([{ message: 'a', code: 'C' }])).toEqual([{ message: 'a', code: 'C' }]);
    expect(parseImportWarnings({ not: 'array' })).toEqual([]);
    expect(parseImportWarnings(null)).toEqual([]);
  });

  it('isTerminalImportStatus marks merged/rejected/failed only', () => {
    expect(isTerminalImportStatus('MERGED')).toBe(true);
    expect(isTerminalImportStatus('REJECTED')).toBe(true);
    expect(isTerminalImportStatus('FAILED')).toBe(true);
    expect(isTerminalImportStatus('UPLOADED')).toBe(false);
    expect(isTerminalImportStatus('PARSED')).toBe(false);
    expect(isTerminalImportStatus('NEEDS_REVIEW')).toBe(false);
  });

  it('toImportSummary and toImportDetail shape API-safe JSON', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z');
    const updatedAt = new Date('2026-01-03T03:04:05.000Z');
    const row = {
      id: 'imp1',
      uploadedFileId: 'up1',
      status: 'NEEDS_REVIEW' as const,
      parserVersion: '1',
      warnings: [{ message: 'w' }],
      rawPreviewPath: null,
      rawExtract: { a: 1 },
      candidatePayload: { profile: { displayName: 'X' } },
      createdAt,
      updatedAt,
      uploadedFile: {
        id: 'up1',
        originalName: 'cv.docx',
        storedPath: '/files/cv.docx',
        mimeType: 'application/whatever',
        sizeBytes: 10,
        sha256: 'abc',
        sourceFormat: 'DOCX' as const,
        uploadedAt: createdAt,
      },
      versions: [{ id: 'ver1' }],
    };
    expect(toImportSummary(row)).toEqual({
      id: 'imp1',
      uploadedFileId: 'up1',
      status: 'NEEDS_REVIEW',
      parserVersion: '1',
      originalFileName: 'cv.docx',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
    const detail = toImportDetail(row);
    expect(detail.warnings).toEqual([{ message: 'w' }]);
    expect(detail.linkedVersionIds).toEqual(['ver1']);
    expect(detail.candidatePayload).toEqual({ profile: { displayName: 'X' } });
    expect(detail.rawExtract).toEqual({ a: 1 });
    expect(detail.candidateSummary).toEqual({
      profileName: null,
      publicationCount: 0,
      patentCount: 0,
      rawHtmlTruncated: false,
    });
  });
});

describe('imports repository (mocked prisma)', () => {
  beforeEach(() => {
    vi.mocked(prisma.uploadedFile.findUnique).mockReset();
    vi.mocked(prisma.contentImport.create).mockReset();
    vi.mocked(prisma.contentImport.update).mockReset();
  });

  it('createContentImportRecord throws when uploaded file is missing', async () => {
    vi.mocked(prisma.uploadedFile.findUnique).mockResolvedValue(null);
    await expect(createContentImportRecord('missing')).rejects.toBeInstanceOf(ImportDomainError);
  });

  it('createContentImportRecord creates import when file exists', async () => {
    vi.mocked(prisma.uploadedFile.findUnique).mockResolvedValue({
      id: 'up1',
      originalName: 'a.docx',
      storedPath: 'p',
      mimeType: 'm',
      sizeBytes: 1,
      sha256: 'h',
      sourceFormat: 'DOCX',
      uploadedAt: new Date(),
    });
    vi.mocked(prisma.contentImport.create).mockResolvedValue({
      id: 'i1',
      uploadedFileId: 'up1',
      status: 'UPLOADED',
      parserVersion: null,
      warnings: null,
      rawPreviewPath: null,
      rawExtract: null,
      candidatePayload: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const imp = await createContentImportRecord('up1');
    expect(imp.id).toBe('i1');
    expect(prisma.contentImport.create).toHaveBeenCalledWith({
      data: { uploadedFileId: 'up1', status: 'UPLOADED' },
    });
  });

  it('updateImportStatus maps missing rows to ImportDomainError', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('not found', {
      code: 'P2025',
      clientVersion: 'test',
    });
    vi.mocked(prisma.contentImport.update).mockRejectedValue(err);
    await expect(updateImportStatus('nope', 'FAILED')).rejects.toBeInstanceOf(ImportDomainError);
  });

  it('saveImportCandidateAndWarnings stores candidate separate from draft workflow', async () => {
    vi.mocked(prisma.contentImport.update).mockResolvedValue({
      id: 'i1',
      uploadedFileId: 'up1',
      status: 'NEEDS_REVIEW',
      parserVersion: 'pv',
      warnings: [{ message: 'm' }],
      rawPreviewPath: null,
      rawExtract: null,
      candidatePayload: { x: 1 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveImportCandidateAndWarnings('i1', {
      candidatePayload: { only: 'candidate' },
      warnings: [{ message: 'check' }],
    });
    expect(prisma.contentImport.update).toHaveBeenCalledWith({
      where: { id: 'i1' },
      data: {
        candidatePayload: { only: 'candidate' },
        warnings: [{ message: 'check' }],
        status: 'NEEDS_REVIEW',
      },
    });
  });
});
