/**
 * Admin status API route
 * GET: Check current admin authentication status
 */

import { NextResponse } from 'next/server';

import { hasValidAdminAccess } from '@/lib/admin-auth';
import { isGitHubConfigured } from '@/lib/github';

export async function GET() {
  try {
    const accessStatus = await hasValidAdminAccess();
    
    return NextResponse.json({
      success: true,
      isLoggedIn: accessStatus.isLoggedIn,
      hasValidDevice: accessStatus.hasValidDevice,
      device: accessStatus.device ? {
        id: accessStatus.device.id,
        label: accessStatus.device.label,
        expiresAt: accessStatus.device.expiresAt,
      } : null,
      githubConfigured: isGitHubConfigured(),
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
