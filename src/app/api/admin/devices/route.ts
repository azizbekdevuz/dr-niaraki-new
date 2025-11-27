/**
 * Admin devices management API route
 * GET: List registered devices
 * POST: Register new device
 * DELETE: Revoke device
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  getDevices,
  registerDevice,
  revokeDevice,
  setDeviceTokenCookie,
  getAdminSessionFromCookie,
} from '@/lib/admin-auth';

/**
 * GET: List all registered devices
 */
export async function GET() {
  try {
    const isLoggedIn = await getAdminSessionFromCookie();
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const devicesData = await getDevices();
    
    // Mask sensitive data
    const maskedDevices = devicesData.devices.map(device => ({
      id: device.id,
      label: device.label,
      userAgent: device.userAgent.slice(0, 50) + '...',
      registeredAt: device.registeredAt,
      lastUsedAt: device.lastUsedAt,
      expiresAt: device.expiresAt,
    }));
    
    return NextResponse.json({
      success: true,
      devices: maskedDevices,
      lastModified: devicesData.lastModified,
    });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Register a new device
 */
export async function POST(request: NextRequest) {
  try {
    const isLoggedIn = await getAdminSessionFromCookie();
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { label } = body;
    
    if (!label || typeof label !== 'string' || label.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Device label is required (min 2 characters)' },
        { status: 400 }
      );
    }
    
    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0] || 'unknown';
    
    // Register device
    const { device, token } = await registerDevice(label, userAgent, ipAddress);
    
    // Set device token cookie
    await setDeviceTokenCookie(token);
    
    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      device: {
        id: device.id,
        label: device.label,
        registeredAt: device.registeredAt,
        expiresAt: device.expiresAt,
      },
    });
  } catch (error) {
    console.error('Register device error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Revoke a device
 */
export async function DELETE(request: NextRequest) {
  try {
    const isLoggedIn = await getAdminSessionFromCookie();
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('id');
    
    if (!deviceId) {
      return NextResponse.json(
        { success: false, message: 'Device ID is required' },
        { status: 400 }
      );
    }
    
    const revoked = await revokeDevice(deviceId);
    
    if (!revoked) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Device revoked successfully',
    });
  } catch (error) {
    console.error('Revoke device error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

