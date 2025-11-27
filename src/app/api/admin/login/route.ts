/**
 * Admin login API route
 * POST: Verify password and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  setAdminSessionCookie,
  getDeviceTokenFromCookie,
  isDeviceRegistered,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }
    
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // Create session
    await setAdminSessionCookie();
    
    // Check if device is already registered
    const deviceToken = await getDeviceTokenFromCookie();
    let isDeviceRegisteredFlag = false;
    
    if (deviceToken) {
      const deviceStatus = await isDeviceRegistered(deviceToken);
      isDeviceRegisteredFlag = deviceStatus.valid;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      isDeviceRegistered: isDeviceRegisteredFlag,
      requiresDeviceRegistration: !isDeviceRegisteredFlag,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

