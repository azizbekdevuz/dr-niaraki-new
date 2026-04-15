import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

describe('adminSecurityConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('legacy JWT is disabled in production unless ALLOW_LEGACY_ADMIN_JWT=1', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { legacyJwtAdminSessionCookieAllowed } = await import('@/server/admin/adminSecurityConfig');
    expect(legacyJwtAdminSessionCookieAllowed()).toBe(false);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOW_LEGACY_ADMIN_JWT', '1');
    const { legacyJwtAdminSessionCookieAllowed: legacy2 } = await import('@/server/admin/adminSecurityConfig');
    expect(legacy2()).toBe(true);
  });

  it('legacy JWT is on in non-production unless ALLOW_LEGACY_ADMIN_JWT=0', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { legacyJwtAdminSessionCookieAllowed } = await import('@/server/admin/adminSecurityConfig');
    expect(legacyJwtAdminSessionCookieAllowed()).toBe(true);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOW_LEGACY_ADMIN_JWT', '0');
    const { legacyJwtAdminSessionCookieAllowed: legacy2 } = await import('@/server/admin/adminSecurityConfig');
    expect(legacy2()).toBe(false);
  });

  it('treats missing or placeholder ADMIN_SECRET as weak', async () => {
    vi.stubEnv('ADMIN_SECRET', '');
    const { isWeakAdminSecretConfigured } = await import('@/server/admin/adminSecurityConfig');
    expect(isWeakAdminSecretConfigured()).toBe(true);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('ADMIN_SECRET', 'default-secret-change-in-production');
    const { isWeakAdminSecretConfigured: w2 } = await import('@/server/admin/adminSecurityConfig');
    expect(w2()).toBe(true);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('ADMIN_SECRET', 'strong-random-secret-value');
    const { isWeakAdminSecretConfigured: w3 } = await import('@/server/admin/adminSecurityConfig');
    expect(w3()).toBe(false);
  });

  it('halts production admin auth when secret is weak', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_SECRET', '');
    const { isProductionAdminAuthHaltedDueToSecret, getLoginDisabledReasonForWeakSecret } = await import(
      '@/server/admin/adminSecurityConfig'
    );
    expect(isProductionAdminAuthHaltedDueToSecret()).toBe(true);
    expect(getLoginDisabledReasonForWeakSecret()).toMatch(/ADMIN_SECRET/);
  });

  it('returns no operator hints when not authenticated (non-Vercel)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');
    const { getOperatorHints } = await import('@/server/admin/adminSecurityConfig');
    expect(getOperatorHints(false)).toEqual([]);
  });

  it('returns operator hints when authenticated and secret is weak', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ADMIN_SECRET', '');
    const { getOperatorHints } = await import('@/server/admin/adminSecurityConfig');
    const hints = getOperatorHints(true);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some((h) => h.includes('ADMIN_SECRET'))).toBe(true);
  });
});

describe('verifyLegacyAdminSessionJwt policy', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('rejects legacy-shaped JWT when policy disables legacy', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOW_LEGACY_ADMIN_JWT', '0');
    vi.stubEnv('ADMIN_SECRET', 'unit-test-secret');
    const { verifyLegacyAdminSessionJwt } = await import('@/server/admin/adminSession');
    const token = jwt.sign({ admin: true }, 'unit-test-secret', { expiresIn: '1h' });
    expect(verifyLegacyAdminSessionJwt(token)).toBe(false);
  });

  it('accepts valid legacy JWT when policy allows legacy', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ADMIN_SECRET', 'unit-test-secret');
    const { verifyLegacyAdminSessionJwt } = await import('@/server/admin/adminSession');
    const token = jwt.sign({ admin: true }, 'unit-test-secret', { expiresIn: '1h' });
    expect(verifyLegacyAdminSessionJwt(token)).toBe(true);
  });
});
