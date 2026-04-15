import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/server/content/publishedSiteContent', () => ({
  getLatestPublishedOrCanonicalSiteContent: vi.fn(),
  getCanonicalSiteContent: vi.fn(),
  getLatestPublishedSiteContent: vi.fn(),
}));

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { assertSiteContent } from '@/content/validators';
import {
  getPublicLiveReadSummary,
  getPublicSiteContentUncached,
} from '@/server/content/publicSiteContent';
import {
  getCanonicalSiteContent,
  getLatestPublishedOrCanonicalSiteContent,
  getLatestPublishedSiteContent,
} from '@/server/content/publishedSiteContent';

describe('getPublicLiveReadSummary', () => {
  beforeEach(() => {
    vi.mocked(getLatestPublishedSiteContent).mockReset();
  });

  it('reports db_published when latest published validates', async () => {
    vi.mocked(getLatestPublishedSiteContent).mockResolvedValue({
      source: 'db_published',
      versionId: 'v-live',
      publishSequence: 5,
      publishedAt: new Date('2026-03-01T00:00:00.000Z'),
      importId: 'imp-x',
      label: 'L',
      changeSummary: 'S',
      data: assertSiteContent(SITE_CONTENT_RAW),
    });
    const s = await getPublicLiveReadSummary();
    expect(s.visitorReadSource).toBe('db_published');
    expect(s.activePublishedVersionId).toBe('v-live');
    expect(s.fallbackReason).toBe('none');
    expect(s.importId).toBe('imp-x');
  });

  it('reports canonical fallback when no published row', async () => {
    vi.mocked(getLatestPublishedSiteContent).mockResolvedValue({ source: 'none', reason: 'no_published' });
    const s = await getPublicLiveReadSummary();
    expect(s.visitorReadSource).toBe('canonical_fallback');
    expect(s.fallbackReason).toBe('no_published');
    expect(s.activePublishedVersionId).toBeNull();
  });

  it('records failed version id when published payload is invalid', async () => {
    vi.mocked(getLatestPublishedSiteContent).mockResolvedValue({
      source: 'none',
      reason: 'invalid_published_payload',
      versionId: 'bad-v',
    });
    const s = await getPublicLiveReadSummary();
    expect(s.visitorReadSource).toBe('canonical_fallback');
    expect(s.fallbackReason).toBe('invalid_published_payload');
    expect(s.failedPublishedVersionId).toBe('bad-v');
  });
});

describe('getPublicSiteContentUncached', () => {
  beforeEach(() => {
    vi.mocked(getLatestPublishedOrCanonicalSiteContent).mockReset();
    vi.mocked(getCanonicalSiteContent).mockReset();
    vi.mocked(getCanonicalSiteContent).mockImplementation(() => assertSiteContent(SITE_CONTENT_RAW));
  });

  it('prefers DB published when helper returns db_published', async () => {
    const data = assertSiteContent(SITE_CONTENT_RAW);
    vi.mocked(getLatestPublishedOrCanonicalSiteContent).mockResolvedValue({
      source: 'db_published',
      chosenSource: 'db_published',
      data,
      versionId: 'v1',
      publishSequence: 2,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      importId: 'imp',
      label: 'L',
      changeSummary: 'S',
    });
    const r = await getPublicSiteContentUncached();
    expect(r.chosenSource).toBe('db_published');
    if (r.chosenSource === 'db_published') {
      expect(r.versionId).toBe('v1');
      expect(r.publishSequence).toBe(2);
    }
  });

  it('returns canonical shape when no published version', async () => {
    vi.mocked(getLatestPublishedOrCanonicalSiteContent).mockResolvedValue({
      chosenSource: 'canonical',
      data: assertSiteContent(SITE_CONTENT_RAW),
      fallbackReason: 'no_published',
    });
    const r = await getPublicSiteContentUncached();
    expect(r.chosenSource).toBe('canonical');
    if (r.chosenSource === 'canonical') {
      expect(r.fallbackReason).toBe('no_published');
    }
  });

  it('falls back to canonical when underlying helper throws', async () => {
    vi.mocked(getLatestPublishedOrCanonicalSiteContent).mockRejectedValue(new Error('db down'));
    const r = await getPublicSiteContentUncached();
    expect(r.chosenSource).toBe('canonical');
    if (r.chosenSource === 'canonical') {
      expect(r.fallbackReason).toBe('db_unavailable');
    }
    expect(getCanonicalSiteContent).toHaveBeenCalled();
  });
});
