import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/server/imports/repository', () => ({
  getContentImportDetail: vi.fn(),
  updateImportStatus: vi.fn(),
}));

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    contentVersion: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/server/content/contentEvents', () => ({
  recordContentEvent: vi.fn(),
}));

import { prisma } from '@/server/db/prisma';
import { ImportMergeError, mergeImportCandidateToWorkingDraft } from '@/server/imports/mergeImportToDraft';
import { getContentImportDetail, updateImportStatus } from '@/server/imports/repository';

describe('mergeImportCandidateToWorkingDraft', () => {
  beforeEach(() => {
    vi.mocked(getContentImportDetail).mockReset();
    vi.mocked(updateImportStatus).mockReset();
    vi.mocked(prisma.contentVersion.create).mockReset();
    vi.mocked(prisma.contentVersion.update).mockReset();
  });

  it('rejects merged imports', async () => {
    vi.mocked(getContentImportDetail).mockResolvedValue({
      id: 'imp',
      status: 'MERGED',
      candidatePayload: {},
      uploadedFile: { originalName: 'x.docx' },
    } as never);
    await expect(
      mergeImportCandidateToWorkingDraft({ importId: 'imp', action: 'create' }),
    ).rejects.toBeInstanceOf(ImportMergeError);
  });
});
