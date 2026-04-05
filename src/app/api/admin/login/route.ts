/**
 * Admin login API route
 * POST: Verify password and create DB-backed session
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  authenticateAdminPassword,
  getDeviceTokenFromCookie,
  isDeviceRegistered,
  issueAdminSessionAfterLogin,
  adminSessionCookieMaxAgeSec,
} from '@/lib/admin-auth';
import { getLoginDisabledReasonForWeakSecret } from '@/server/admin/adminSecurityConfig';

export async function POST(request: NextRequest) {
  try {
    const loginDisabled = getLoginDisabledReasonForWeakSecret();
    if (loginDisabled) {
      return NextResponse.json(
        { success: false, message: loginDisabled, code: 'ADMIN_SECRET_REQUIRED' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    const auth = await authenticateAdminPassword(password);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    const { opaqueCookieValue } = await issueAdminSessionAfterLogin(auth.adminUserId);

    const deviceToken = await getDeviceTokenFromCookie();
    let isDeviceRegisteredFlag = false;

    if (deviceToken) {
      const deviceStatus = await isDeviceRegistered(deviceToken);
      isDeviceRegisteredFlag = deviceStatus.valid;
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      isDeviceRegistered: isDeviceRegisteredFlag,
      requiresDeviceRegistration: !isDeviceRegisteredFlag,
    });

    response.cookies.set('admin_session', opaqueCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: adminSessionCookieMaxAgeSec(),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
