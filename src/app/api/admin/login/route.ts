/**
 * Admin login API route
 * POST: Verify password and create session
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

import {
  verifyAdminPassword,
  getDeviceTokenFromCookie,
  isDeviceRegistered,
} from '@/lib/admin-auth';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret-change-in-production';

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
    
    // Create session token
    const token = jwt.sign({ admin: true }, ADMIN_SECRET, { expiresIn: '24h' });
    
    // Check if device is already registered (before creating response)
    const deviceToken = await getDeviceTokenFromCookie();
    let isDeviceRegisteredFlag = false;
    
    if (deviceToken) {
      const deviceStatus = await isDeviceRegistered(deviceToken);
      isDeviceRegisteredFlag = deviceStatus.valid;
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      isDeviceRegistered: isDeviceRegisteredFlag,
      requiresDeviceRegistration: !isDeviceRegisteredFlag,
    });
    
    // Set cookie directly on the response
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/', // Change from '/admin' to '/' so it's available to both /admin and /api/admin routes
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
