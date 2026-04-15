import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/admin-auth', () => ({
  hasValidAdminAccess: vi.fn(),
}));

import { hasValidAdminAccess } from '@/lib/admin-auth';
import { formatWorkflowError } from '@/lib/adminContentWorkflowClient';
import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  bootstrapDraftBodySchema,
  contentVersionSummary,
  listVersionsQuerySchema,
  nextResponseFromWorkflowError,
  publishDraftBodySchema,
  restoreVersionBodySchema,
  saveDraftBodySchema,
  versionIdParamSchema,
} from '@/server/admin/contentWorkflowHttp';
import { ContentWorkflowError } from '@/server/content/contentWorkflowCore';

describe('requireFullAdminAccessForContent', () => {
  beforeEach(() => {
    vi.mocked(hasValidAdminAccess).mockReset();
  });

  it('returns 401 when not logged in', async () => {
    vi.mocked(hasValidAdminAccess).mockResolvedValue({
      isLoggedIn: false,
      hasValidDevice: false,
    });
    const res = await requireFullAdminAccessForContent();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
    const json = await res!.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('UNAUTHORIZED');
  });

  it('returns 403 when logged in but device missing', async () => {
    vi.mocked(hasValidAdminAccess).mockResolvedValue({
      isLoggedIn: true,
      hasValidDevice: false,
    });
    const res = await requireFullAdminAccessForContent();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const json = await res!.json();
    expect(json.error).toBe('DEVICE_REQUIRED');
  });

  it('returns null when session and device are valid', async () => {
    vi.mocked(hasValidAdminAccess).mockResolvedValue({
      isLoggedIn: true,
      hasValidDevice: true,
    });
    const res = await requireFullAdminAccessForContent();
    expect(res).toBeNull();
  });
});

describe('nextResponseFromWorkflowError', () => {
  it('maps known workflow errors to JSON and status', () => {
    const r = nextResponseFromWorkflowError(new ContentWorkflowError('DRAFT_EXISTS', 'dup'));
    expect(r).not.toBeNull();
    expect(r!.status).toBe(409);
  });

  it('returns null for non-workflow errors', () => {
    expect(nextResponseFromWorkflowError(new Error('x'))).toBeNull();
  });
});

describe('content workflow request schemas', () => {
  it('saveDraftBodySchema requires payload', () => {
    expect(saveDraftBodySchema.safeParse({}).success).toBe(false);
    expect(saveDraftBodySchema.safeParse({ payload: { a: 1 } }).success).toBe(true);
  });

  it('bootstrapDraftBodySchema accepts empty object', () => {
    expect(bootstrapDraftBodySchema.safeParse({}).success).toBe(true);
  });

  it('publishDraftBodySchema accepts empty object', () => {
    expect(publishDraftBodySchema.safeParse({}).success).toBe(true);
  });

  it('restoreVersionBodySchema accepts empty object', () => {
    expect(restoreVersionBodySchema.safeParse({}).success).toBe(true);
  });

  it('versionIdParamSchema rejects empty', () => {
    expect(versionIdParamSchema.safeParse('').success).toBe(false);
    expect(versionIdParamSchema.safeParse('clxxxxxxxx').success).toBe(true);
  });

  it('listVersionsQuerySchema coerces take', () => {
    const r = listVersionsQuerySchema.safeParse({ take: '10' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.take).toBe(10);
    }
  });
});

describe('formatWorkflowError', () => {
  it('maps UNAUTHORIZED and DEVICE_REQUIRED', () => {
    expect(
      formatWorkflowError({
        success: false,
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'x',
      }),
    ).toContain('log in');
    expect(
      formatWorkflowError({
        success: false,
        status: 403,
        error: 'DEVICE_REQUIRED',
        message: 'x',
      }),
    ).toContain('Register');
  });
});

describe('contentVersionSummary', () => {
  it('omits payload from the serialized shape', () => {
    const row = {
      id: 'v1',
      status: 'PUBLISHED',
      label: 'L',
      changeSummary: null,
      createdBy: null,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: new Date('2020-01-02T00:00:00.000Z'),
      publishedAt: new Date('2020-01-03T00:00:00.000Z'),
      publishSequence: 1,
      draftSlot: null,
      payload: { heavy: true },
      importId: null,
    };
    const s = contentVersionSummary(row as never);
    expect('payload' in s).toBe(false);
    expect(s.id).toBe('v1');
    expect(s.publishSequence).toBe(1);
    expect(s.importId).toBeNull();
  });

  it('includes importId for merge-to-draft provenance', () => {
    const row = {
      id: 'v2',
      status: 'DRAFT',
      label: null,
      changeSummary: 'Merged',
      createdBy: null,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: new Date('2020-01-02T00:00:00.000Z'),
      publishedAt: null,
      publishSequence: null,
      draftSlot: 'main',
      payload: {},
      importId: 'importabc',
    };
    const s = contentVersionSummary(row as never);
    expect(s.importId).toBe('importabc');
  });
});
