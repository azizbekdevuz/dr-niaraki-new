/**
 * Admin authentication and device management
 * Handles password verification and device token issuance
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import type { DeviceRecord, DeviceTokenPayload, AdminDevicesData } from '@/types/admin';

// Environment configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret-change-in-production';
const DEVICE_TOKEN_EXPIRY_DAYS = 365;

const DEVICES_FILE = path.join(process.cwd(), 'src', 'datasets', 'admin_devices.json');

/**
 * Hashes a string using SHA-256
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Verifies the admin password
 */
export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD not configured');
    return false;
  }
  return password === ADMIN_PASSWORD;
}

/**
 * Gets all registered devices
 */
export async function getDevices(): Promise<AdminDevicesData> {
  try {
    const content = await fs.readFile(DEVICES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      devices: [],
      lastModified: new Date().toISOString(),
    };
  }
}

/**
 * Saves devices data
 */
async function saveDevices(data: AdminDevicesData): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(DEVICES_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory may already exist
  }
  await fs.writeFile(DEVICES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Generates a device token
 */
export function generateDeviceToken(deviceId: string, ipHash: string): string {
  const payload: DeviceTokenPayload = {
    deviceId,
    ipHash,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60),
  };
  
  return jwt.sign(payload, ADMIN_SECRET, { algorithm: 'HS256' });
}

/**
 * Verifies a device token
 */
export function verifyDeviceToken(token: string): DeviceTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_SECRET, { algorithms: ['HS256'] }) as DeviceTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Registers a new device
 */
export async function registerDevice(
  label: string,
  userAgent: string,
  ipAddress: string
): Promise<{ device: DeviceRecord; token: string }> {
  const deviceId = crypto.randomUUID();
  const ipHash = hashString(ipAddress);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEVICE_TOKEN_EXPIRY_DAYS);
  
  const device: DeviceRecord = {
    id: deviceId,
    label,
    userAgent: userAgent.slice(0, 200),
    ipHash,
    registeredAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  
  const token = generateDeviceToken(deviceId, ipHash);
  
  // Save device
  const devicesData = await getDevices();
  devicesData.devices.push(device);
  (devicesData as unknown as { lastModified: string }).lastModified = new Date().toISOString();
  await saveDevices(devicesData);
  
  return { device, token };
}

/**
 * Revokes a device by ID
 */
export async function revokeDevice(deviceId: string): Promise<boolean> {
  const devicesData = await getDevices();
  const initialLength = devicesData.devices.length;
  
  (devicesData as unknown as { devices: DeviceRecord[] }).devices = devicesData.devices.filter(d => d.id !== deviceId);
  
  if (devicesData.devices.length < initialLength) {
    (devicesData as unknown as { lastModified: string }).lastModified = new Date().toISOString();
    await saveDevices(devicesData);
    return true;
  }
  
  return false;
}

/**
 * Checks if a device is registered and valid
 */
export async function isDeviceRegistered(token: string): Promise<{ valid: boolean; device?: DeviceRecord }> {
  const payload = verifyDeviceToken(token);
  if (!payload) {
    return { valid: false };
  }
  
  const devicesData = await getDevices();
  const device = devicesData.devices.find(d => d.id === payload.deviceId);
  
  if (!device) {
    return { valid: false };
  }
  
  // Check if expired
  if (new Date(device.expiresAt) < new Date()) {
    return { valid: false };
  }
  
  // Update last used time
  (device as unknown as { lastUsedAt: string }).lastUsedAt = new Date().toISOString();
  await saveDevices(devicesData);
  
  return { valid: true, device };
}

/**
 * Gets device token from cookies
 */
export async function getDeviceTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('device_token');
  return tokenCookie?.value || null;
}

/**
 * Sets device token cookie
 */
export async function setDeviceTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('device_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/', // Change from '/admin' to '/'
  });
}

/**
 * Clears device token cookie
 */
export async function clearDeviceTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('device_token');
}

/**
 * Gets admin session token from cookies
 */
export async function getAdminSessionFromCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie?.value) {
    return false;
  }
  
  try {
    const payload = jwt.verify(sessionCookie.value, ADMIN_SECRET);
    return Boolean(payload);
  } catch {
    return false;
  }
}

/**
 * Sets admin session cookie
 */
export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = jwt.sign({ admin: true }, ADMIN_SECRET, { expiresIn: '24h' });
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/', // Change from '/admin' to '/' so it's available for all routes
  });
}

/**
 * Clears admin session cookie
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Checks if current request has valid admin access
 */
export async function hasValidAdminAccess(): Promise<{
  isLoggedIn: boolean;
  hasValidDevice: boolean;
  device?: DeviceRecord;
}> {
  const isLoggedIn = await getAdminSessionFromCookie();
  if (!isLoggedIn) {
    return { isLoggedIn: false, hasValidDevice: false };
  }
  
  const token = await getDeviceTokenFromCookie();
  if (!token) {
    return { isLoggedIn: true, hasValidDevice: false };
  }
  
  const deviceStatus = await isDeviceRegistered(token);
  return {
    isLoggedIn: true,
    hasValidDevice: deviceStatus.valid,
    device: deviceStatus.device,
  };
}
