import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/storage', () => ({
  saveUploadedFile: vi.fn(),
  addUploadMetadata: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/server/imports/createImport', () => ({
  createUploadedFileAndImport: vi.fn(),
}));

vi.mock('@/server/imports/repository', () => ({
  persistImportParseOutcome: vi.fn(),
  persistImportParseFailure: vi.fn(),
}));

vi.mock('@/parser/docxParser', () => ({
  PARSER_VERSION: 'test-parser',
  parseDocxToDetails: vi.fn(),
}));

import { addUploadMetadata, saveUploadedFile } from '@/lib/storage';
import { parseDocxToDetails } from '@/parser/docxParser';
import { createUploadedFileAndImport } from '@/server/imports/createImport';
import {
  DocxImportParseError,
  processDocxUploadWithImportPersistence,
} from '@/server/imports/processDocxUploadImport';
import { persistImportParseFailure, persistImportParseOutcome } from '@/server/imports/repository';
import type { Details } from '@/types/details';

const sampleDetails: Details = {
  profile: { name: 'N', title: null, photoUrl: null, summary: null, meta: null },
  about: {
    brief: null,
    full: null,
    education: [],
    positions: [],
    awards: [],
    languages: [],
  },
  research: { interests: [], projects: [], grants: [] },
  publications: [{ id: 'p1', title: 'Paper', authors: null, journal: null, year: 2024, type: 'journal', raw: null }],
  patents: [],
  contact: {
    email: 'n@univ.edu',
    personalEmail: null,
    phone: null,
    fax: null,
    cellPhone: null,
    address: null,
    department: null,
    university: null,
    website: null,
    cvUrl: null,
    social: {},
  },
  rawHtml: '<p>x</p>',
  counts: { publications: 1, patents: 0, projects: 0, awards: 0, students: 0 },
  meta: {
    sourceFileName: 'c.docx',
    parsedAt: '2026-01-01T00:00:00.000Z',
    parserVersion: 'test-parser',
    commitSha: null,
    uploader: 'admin',
    warnings: [],
  },
};

describe('processDocxUploadWithImportPersistence', () => {
  beforeEach(() => {
    vi.mocked(addUploadMetadata).mockClear();
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'resume_2026-01-01_00-00.docx',
      filepath: '/x',
      storedPath: '/uploads/resume_2026-01-01_00-00.docx',
      sha256: 'deadbeef',
      fileSizeBytes: 4,
    });
    vi.mocked(createUploadedFileAndImport).mockResolvedValue({
      uploadedFile: {
        id: 'uf1',
        originalName: 'c.docx',
        storedPath: '/uploads/resume_2026-01-01_00-00.docx',
        mimeType: 'application/…',
        sizeBytes: 4,
        sha256: 'deadbeef',
        sourceFormat: 'DOCX',
        uploadedAt: new Date(),
      },
      import: {
        id: 'im1',
        uploadedFileId: 'uf1',
        status: 'UPLOADED',
        parserVersion: null,
        warnings: null,
        rawPreviewPath: null,
        rawExtract: null,
        candidatePayload: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    vi.mocked(parseDocxToDetails).mockResolvedValue({ data: sampleDetails, warnings: [] });
    vi.mocked(persistImportParseOutcome).mockResolvedValue({} as never);
    vi.mocked(persistImportParseFailure).mockResolvedValue({} as never);
  });

  it('persists import outcome and returns import summary on success', async () => {
    const r = await processDocxUploadWithImportPersistence({
      buffer: Buffer.from('docx'),
      originalName: 'c.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploaderLabel: 'admin',
    });
    expect(saveUploadedFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      'c.docx',
      'admin',
      { persistToLegacyUploadsMeta: false }
    );
    expect(addUploadMetadata).not.toHaveBeenCalled();
    expect(r.import.persisted).toBe(true);
    expect(r.import.importId).toBe('im1');
    expect(['PARSED', 'NEEDS_REVIEW']).toContain(r.import.status);
    expect(persistImportParseOutcome).toHaveBeenCalledWith(
      'im1',
      expect.objectContaining({
        parserVersion: 'test-parser',
      }),
    );
    expect(createUploadedFileAndImport).toHaveBeenCalledWith(
      expect.objectContaining({
        storedPath: '/uploads/resume_2026-01-01_00-00.docx',
      }),
    );
    expect(r.data.profile.name).toBe('N');
  });

  it('appends legacy manifest when Prisma create fails', async () => {
    vi.mocked(createUploadedFileAndImport).mockRejectedValueOnce(new Error('db down'));
    const r = await processDocxUploadWithImportPersistence({
      buffer: Buffer.from('docx'),
      originalName: 'c.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploaderLabel: 'admin',
    });
    expect(r.import.persisted).toBe(false);
    expect(addUploadMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'resume_2026-01-01_00-00.docx',
        originalName: 'c.docx',
      })
    );
  });

  it('marks import failed and throws DocxImportParseError when parser throws', async () => {
    vi.mocked(parseDocxToDetails).mockRejectedValue(new Error('mammoth blew up'));
    await expect(
      processDocxUploadWithImportPersistence({
        buffer: Buffer.from('x'),
        originalName: 'c.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploaderLabel: null,
      }),
    ).rejects.toBeInstanceOf(DocxImportParseError);
    expect(persistImportParseFailure).toHaveBeenCalledWith(
      'im1',
      expect.objectContaining({
        parserVersion: 'test-parser',
      }),
    );
  });
});
