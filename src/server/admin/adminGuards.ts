import 'server-only';

import { NextResponse } from 'next/server';

import { getAdminSessionFromCookie } from '@/lib/admin-auth';

/**
 * Shared 401 helper for admin routes that only require a logged-in session
 * (no registered device). Prefer this over ad hoc checks.
 */
export async function unauthorizedUnlessAdminSession(): Promise<NextResponse | null> {
  if (!(await getAdminSessionFromCookie())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
