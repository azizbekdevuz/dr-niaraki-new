import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/server/content/contentWorkflowCore', () => ({
  getLatestPublishedVersion: vi.fn(),
}));

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent } from '@/content/validators';
import { getLatestPublishedVersion } from '@/server/content/contentWorkflowCore';
import {
  getCanonicalSiteContent,
  getLatestPublishedOrCanonicalSiteContent,
  getLatestPublishedSiteContent,
} from '@/server/content/publishedSiteContent';

describe('publishedSiteContent helpers', () => {
  beforeEach(() => {
    vi.mocked(getLatestPublishedVersion).mockReset();
  });

  it('getCanonicalSiteContent matches validated canonical seed', () => {
    const c = getCanonicalSiteContent();
    expect(c.profile.displayName).toEqual(assertSiteContent(SITE_CONTENT_RAW).profile.displayName);
  });

  it('getLatestPublishedSiteContent returns validated data when a published row exists', async () => {
    vi.mocked(getLatestPublishedVersion).mockResolvedValue({
      id: 'pub-row',
      status: 'PUBLISHED',
      payload: SITE_CONTENT_RAW,
      publishSequence: 3,
      publishedAt: new Date('2026-02-01T00:00:00.000Z'),
      importId: 'imp1',
      label: 'L',
      changeSummary: 'S',
      draftSlot: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
    } as never);
    const r = await getLatestPublishedSiteContent();
    expect(r.source).toBe('db_published');
    if (r.source === 'db_published') {
      expect(r.versionId).toBe('pub-row');
      expect(r.publishSequence).toBe(3);
      expect(r.importId).toBe('imp1');
      expect(r.data.profile.displayName).toBeTruthy();
    }
  });

  it('getLatestPublishedSiteContent reports invalid published payloads', async () => {
    vi.mocked(getLatestPublishedVersion).mockResolvedValue({
      id: 'bad',
      status: 'PUBLISHED',
      payload: { not: 'site content' },
      publishSequence: 1,
      publishedAt: new Date(),
      importId: null,
      label: null,
      changeSummary: null,
      draftSlot: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
    } as never);
    const r = await getLatestPublishedSiteContent();
    expect(r).toMatchObject({ source: 'none', reason: 'invalid_published_payload', versionId: 'bad' });
  });

  it('getLatestPublishedOrCanonicalSiteContent falls back to canonical when nothing published', async () => {
    vi.mocked(getLatestPublishedVersion).mockResolvedValue(null);
    const r = await getLatestPublishedOrCanonicalSiteContent();
    expect(r.chosenSource).toBe('canonical');
    if (r.chosenSource === 'canonical') {
      expect(r.fallbackReason).toBe('no_published');
      expect(r.data.profile.displayName).toBeTruthy();
    }
  });

  it('getLatestPublishedOrCanonicalSiteContent falls back when published payload is invalid', async () => {
    vi.mocked(getLatestPublishedVersion).mockResolvedValue({
      id: 'bad2',
      status: 'PUBLISHED',
      payload: {},
      publishSequence: 1,
      publishedAt: new Date(),
      importId: null,
      label: null,
      changeSummary: null,
      draftSlot: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
    } as never);
    const r = await getLatestPublishedOrCanonicalSiteContent();
    expect(r.chosenSource).toBe('canonical');
    if (r.chosenSource === 'canonical') {
      expect(r.fallbackReason).toBe('invalid_published_payload');
      expect(r.failedVersionId).toBe('bad2');
    }
  });
});
