/**
 * Admin status API route
 * GET: Check current admin authentication status and operator-facing security hints
 */

import { NextResponse } from 'next/server';

import { hasValidAdminAccess } from '@/lib/admin-auth';
import { isGitHubConfigured } from '@/lib/github';
import {
  getLoginDisabledReasonForWeakSecret,
  getOperatorHints,
  isWeakAdminSecretConfigured,
  legacyJwtAdminSessionCookieAllowed,
  isProductionAdminAuthHaltedDueToSecret,
} from '@/server/admin/adminSecurityConfig';

export async function GET() {
  try {
    const accessStatus = await hasValidAdminAccess();
    const loginDisabledReason = getLoginDisabledReasonForWeakSecret();
    const operatorHints = getOperatorHints(accessStatus.isLoggedIn);

    return NextResponse.json({
      success: true,
      isLoggedIn: accessStatus.isLoggedIn,
      hasValidDevice: accessStatus.hasValidDevice,
      device: accessStatus.device
        ? {
            id: accessStatus.device.id,
            label: accessStatus.device.label,
            expiresAt: accessStatus.device.expiresAt,
          }
        : null,
      githubConfigured: isGitHubConfigured(),
      loginDisabledReason,
      operatorHints,
      securityMode: {
        legacyJwtSessionCookiesAccepted: legacyJwtAdminSessionCookieAllowed(),
        productionAdminAuthHaltedForSecret: isProductionAdminAuthHaltedDueToSecret(),
        ...(accessStatus.isLoggedIn
          ? { weakAdminSecretConfigured: isWeakAdminSecretConfigured() }
          : {}),
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
