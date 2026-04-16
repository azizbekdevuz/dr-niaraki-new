/**
 * Admin authentication: DB-backed session (opaque cookie + Prisma `Session`),
 * scrypt password verification on `AdminUser`, and device registration (secondary gate).
 *
 * Legacy JWT `admin_session` cookies: accepted only when `legacyJwtAdminSessionCookieAllowed()`
 * (off in production unless `ALLOW_LEGACY_ADMIN_JWT=1`; non-production on unless `ALLOW_LEGACY_ADMIN_JWT=0`).
 * New logins always issue opaque DB-backed session tokens.
 */

import 'server-only';

import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { authenticateAdminPassword as authenticateAdminPasswordDb } from '@/server/admin/adminBootstrap';
import {
  adminFindDeviceById,
  adminRegisterDevice,
  adminRevokeDevice,
  adminTouchDeviceLastUsedThrottled,
  loadAdminDevicesData,
} from '@/server/admin/adminDevicesStore';
import {
  getAdminSecretForCrypto,
  isProductionAdminAuthHaltedDueToSecret,
} from '@/server/admin/adminSecurityConfig';
import {
  adminSessionCookieMaxAgeSec,
  createDbSessionForAdminUser,
  hasValidOpaqueDbSession,
  isOpaqueSessionCookieValue,
  looksLikeLegacyJwtSessionCookie,
  revokeDbSessionByOpaqueCookie,
  revokeOtherSessionsForUser,
  verifyLegacyAdminSessionJwt,
} from '@/server/admin/adminSession';
import type { AdminDevicesData, DeviceRecord, DeviceTokenPayload } from '@/types/admin';

const DEVICE_TOKEN_EXPIRY_DAYS = 365;

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export { authenticateAdminPasswordDb as authenticateAdminPassword };

export async function issueAdminSessionAfterLogin(adminUserId: string): Promise<{
  opaqueCookieValue: string;
  expiresAt: Date;
}> {
  await revokeOtherSessionsForUser(adminUserId);
  return createDbSessionForAdminUser(adminUserId);
}

export async function getDevices(): Promise<AdminDevicesData> {
  return loadAdminDevicesData();
}

function generateDeviceToken(deviceId: string, ipHash: string): string {
  const payload: DeviceTokenPayload = {
    deviceId,
    ipHash,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
  };

  return jwt.sign(payload, getAdminSecretForCrypto(), { algorithm: 'HS256' });
}

function verifyDeviceToken(token: string): DeviceTokenPayload | null {
  if (isProductionAdminAuthHaltedDueToSecret()) {
    return null;
  }
  try {
    return jwt.verify(token, getAdminSecretForCrypto(), { algorithms: ['HS256'] }) as DeviceTokenPayload;
  } catch {
    return null;
  }
}

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

  await adminRegisterDevice(device);

  return { device, token };
}

export async function revokeDevice(deviceId: string): Promise<boolean> {
  return adminRevokeDevice(deviceId);
}

export async function isDeviceRegistered(token: string): Promise<{ valid: boolean; device?: DeviceRecord }> {
  const payload = verifyDeviceToken(token);
  if (!payload) {
    return { valid: false };
  }

  const device = await adminFindDeviceById(payload.deviceId);

  if (!device) {
    return { valid: false };
  }

  if (new Date(device.expiresAt) < new Date()) {
    return { valid: false };
  }

  await adminTouchDeviceLastUsedThrottled(device.id);

  return { valid: true, device };
}

export async function getDeviceTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('device_token');
  return tokenCookie?.value || null;
}

export async function setDeviceTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('device_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAdminSessionFromCookie(): Promise<boolean> {
  if (isProductionAdminAuthHaltedDueToSecret()) {
    return false;
  }
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie?.value) {
    return false;
  }
  const value = sessionCookie.value;

  if (looksLikeLegacyJwtSessionCookie(value)) {
    return verifyLegacyAdminSessionJwt(value);
  }

  if (!isOpaqueSessionCookieValue(value)) {
    return false;
  }

  return hasValidOpaqueDbSession(value);
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const value = sessionCookie?.value;
  if (value && isOpaqueSessionCookieValue(value)) {
    await revokeDbSessionByOpaqueCookie(value);
  }
  cookieStore.delete('admin_session');
}

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

export { adminSessionCookieMaxAgeSec };
