import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  filenameFromStoredPath,
  importWarningsToDisplayStrings,
  manifestRowIsRedundantWithPrismaMerge,
  resolvePrismaUploadHistoryTake,
} from '@/server/admin/uploadHistoryAdminUtils';

describe('uploadHistoryAdminUtils', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('filenameFromStoredPath takes basename from /uploads paths', () => {
    expect(filenameFromStoredPath('/uploads/resume_2025-01-01_12-00.docx')).toBe('resume_2025-01-01_12-00.docx');
    expect(filenameFromStoredPath('resume_plain.docx')).toBe('resume_plain.docx');
    expect(filenameFromStoredPath('vercel-blob-path:admin-cv/resume_2025-01-01_12-00.docx')).toBe(
      'resume_2025-01-01_12-00.docx',
    );
  });

  it('importWarningsToDisplayStrings maps arrays', () => {
    expect(importWarningsToDisplayStrings(null)).toEqual([]);
    expect(importWarningsToDisplayStrings(['a', 'b'])).toEqual(['a', 'b']);
    expect(importWarningsToDisplayStrings([{ k: 1 }])).toEqual(['{"k":1}']);
  });

  it('manifestRowIsRedundantWithPrismaMerge respects filename and ids', () => {
    const fn = new Set(['a.docx']);
    const ids = new Set(['uf1']);
    const imp = new Set(['ci1']);
    expect(manifestRowIsRedundantWithPrismaMerge({ filename: 'a.docx' }, fn, ids, imp)).toBe(true);
    expect(manifestRowIsRedundantWithPrismaMerge({ filename: 'b.docx' }, fn, ids, imp)).toBe(false);
    expect(
      manifestRowIsRedundantWithPrismaMerge({ filename: 'b.docx', prismaUploadedFileId: 'uf1' }, fn, ids, imp)
    ).toBe(true);
    expect(
      manifestRowIsRedundantWithPrismaMerge({ filename: 'b.docx', contentImportId: 'ci1' }, fn, ids, imp)
    ).toBe(true);
  });

  it('resolvePrismaUploadHistoryTake clamps env', () => {
    expect(resolvePrismaUploadHistoryTake()).toBe(100);
    vi.stubEnv('ADMIN_UPLOAD_HISTORY_PRISMA_TAKE', '250');
    expect(resolvePrismaUploadHistoryTake()).toBe(250);
    vi.stubEnv('ADMIN_UPLOAD_HISTORY_PRISMA_TAKE', '99999');
    expect(resolvePrismaUploadHistoryTake()).toBe(500);
    vi.stubEnv('ADMIN_UPLOAD_HISTORY_PRISMA_TAKE', '0');
    expect(resolvePrismaUploadHistoryTake()).toBe(100);
  });
});
