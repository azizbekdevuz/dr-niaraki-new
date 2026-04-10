import 'server-only';

import { NextResponse } from 'next/server';

import { hasValidAdminAccess } from '@/lib/admin-auth';

/**
 * Sensitive editorial APIs: valid admin session (DB-backed opaque cookie, or legacy JWT only when policy allows)
 * plus a registered device token. In production with a placeholder/missing `ADMIN_SECRET`, all admin auth is halted.
 * Identity is the session tied to `AdminUser`; device trust is an extra gate.
 * Upload list/history and device management use session-only guards.
 */
export async function requireFullAdminAccessForContent(): Promise<NextResponse | null> {
  const access = await hasValidAdminAccess();
  if (!access.isLoggedIn) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED', message: 'Unauthorized' },
      { status: 401 },
    );
  }
  if (!access.hasValidDevice) {
    return NextResponse.json(
      {
        ok: false,
        error: 'DEVICE_REQUIRED',
        message: 'Registered device required for content workflow actions.',
      },
      { status: 403 },
    );
  }
  return null;
}
