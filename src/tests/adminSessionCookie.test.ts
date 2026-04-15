import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

describe('admin session cookie hashing', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('is deterministic for a fixed secret and opaque token', async () => {
    vi.stubEnv('ADMIN_SECRET', 'test-secret-for-hmac');
    const { hashSessionCookieOpaque } = await import('@/server/admin/adminSession');
    const a = hashSessionCookieOpaque('a'.repeat(64));
    const b = hashSessionCookieOpaque('a'.repeat(64));
    expect(a).toBe(b);
    expect(a.length).toBe(64);
  });

  it('classifies legacy JWT-shaped cookies', async () => {
    const { looksLikeLegacyJwtSessionCookie, isOpaqueSessionCookieValue } = await import(
      '@/server/admin/adminSession'
    );
    expect(looksLikeLegacyJwtSessionCookie('aa.bb.cc')).toBe(true);
    expect(isOpaqueSessionCookieValue('aa.bb.cc')).toBe(false);
    expect(isOpaqueSessionCookieValue('ab'.repeat(32))).toBe(true);
  });
});
