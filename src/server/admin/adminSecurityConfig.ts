import 'server-only';

/** Documented placeholder — must not be relied on in production. */
const DEFAULT_ADMIN_SECRET_PLACEHOLDER = 'default-secret-change-in-production';

let weakSecretDevWarningLogged = false;

export function isWeakAdminSecretConfigured(): boolean {
  const s = process.env.ADMIN_SECRET?.trim();
  return !s || s === DEFAULT_ADMIN_SECRET_PLACEHOLDER;
}

/**
 * In production, admin auth (sessions, legacy JWT, device tokens) is halted until a real secret is set.
 */
export function isProductionAdminAuthHaltedDueToSecret(): boolean {
  return process.env.NODE_ENV === 'production' && isWeakAdminSecretConfigured();
}

/**
 * Secret used for HMAC session hashing and device JWTs. Returns the documented placeholder when unset
 * in development so local workflows keep working; production must set `ADMIN_SECRET` or admin auth is halted.
 */
export function getAdminSecretForCrypto(): string {
  const trimmed = process.env.ADMIN_SECRET?.trim();
  if (trimmed && trimmed !== DEFAULT_ADMIN_SECRET_PLACEHOLDER) {
    return trimmed;
  }
  if (process.env.NODE_ENV !== 'production' && !weakSecretDevWarningLogged) {
    weakSecretDevWarningLogged = true;
    console.warn(
      '[admin] ADMIN_SECRET is missing or still the documented placeholder. Set a strong secret before production deploy.'
    );
  }
  return trimmed || DEFAULT_ADMIN_SECRET_PLACEHOLDER;
}

/**
 * Legacy `admin_session` JWT cookies (three-part segments) are transitional.
 * - Production: off unless `ALLOW_LEGACY_ADMIN_JWT=1`.
 * - Non-production: on unless `ALLOW_LEGACY_ADMIN_JWT=0`.
 */
export function legacyJwtAdminSessionCookieAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_LEGACY_ADMIN_JWT === '1';
  }
  return process.env.ALLOW_LEGACY_ADMIN_JWT !== '0';
}

export function getLoginDisabledReasonForWeakSecret(): string | null {
  if (!isProductionAdminAuthHaltedDueToSecret()) {
    return null;
  }
  return 'Admin sign-in is disabled: set ADMIN_SECRET to a strong non-default value in production.';
}

export function getOperatorHints(isAuthenticated: boolean): string[] {
  const hints: string[] = [];
  if (process.env.VERCEL === '1' && !process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    hints.push(
      'Vercel deploy without BLOB_READ_WRITE_TOKEN: enable a private Blob store and env var so DOCX uploads persist (ephemeral disk is not durable).',
    );
  }
  if (isAuthenticated && process.env.DATABASE_URL?.trim()) {
    hints.push(
      'DATABASE_URL is set: registered devices are kept in Postgres (not GitHub `admin_devices.json`), avoiding concurrent JSON commit conflicts.',
    );
  }
  if (!isAuthenticated) {
    return hints;
  }
  if (isWeakAdminSecretConfigured()) {
    hints.push(
      'ADMIN_SECRET is unset or still the documented placeholder. Use a strong random value before any production deploy.'
    );
  }
  if (process.env.NODE_ENV !== 'production' && legacyJwtAdminSessionCookieAllowed()) {
    hints.push(
      'Non-production: legacy JWT-shaped admin_session cookies are still accepted. Set ALLOW_LEGACY_ADMIN_JWT=0 to mirror production (where legacy JWT is off unless ALLOW_LEGACY_ADMIN_JWT=1).'
    );
  }
  return hints;
}
