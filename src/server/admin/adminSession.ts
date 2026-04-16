import 'server-only';

import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import {
  getAdminSecretForCrypto,
  isProductionAdminAuthHaltedDueToSecret,
  legacyJwtAdminSessionCookieAllowed,
} from '@/server/admin/adminSecurityConfig';
import { prisma } from '@/server/db/prisma';

const SESSION_MAX_MS = 24 * 60 * 60 * 1000;

/** HMAC-SHA256 of opaque cookie value — stored in `Session.tokenHash`. */
export function hashSessionCookieOpaque(opaque: string): string {
  return crypto.createHmac('sha256', getAdminSecretForCrypto()).update(opaque).digest('hex');
}

export function looksLikeLegacyJwtSessionCookie(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export function verifyLegacyAdminSessionJwt(value: string): boolean {
  if (!legacyJwtAdminSessionCookieAllowed()) {
    return false;
  }
  try {
    jwt.verify(value, getAdminSecretForCrypto());
    return true;
  } catch {
    return false;
  }
}

const OPAQUE_HEX_LEN = 64;

export function isOpaqueSessionCookieValue(value: string): boolean {
  return value.length === OPAQUE_HEX_LEN && /^[a-f0-9]+$/i.test(value);
}

function newOpaqueSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createDbSessionForAdminUser(adminUserId: string): Promise<{
  opaqueCookieValue: string;
  expiresAt: Date;
}> {
  if (isProductionAdminAuthHaltedDueToSecret()) {
    throw new Error('Cannot create admin session while production ADMIN_SECRET is unset or placeholder.');
  }
  const opaqueCookieValue = newOpaqueSessionToken();
  const tokenHash = hashSessionCookieOpaque(opaqueCookieValue);
  const expiresAt = new Date(Date.now() + SESSION_MAX_MS);
  await prisma.session.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  });
  return { opaqueCookieValue, expiresAt };
}

export async function revokeOtherSessionsForUser(adminUserId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { adminUserId } });
}

export async function hasValidOpaqueDbSession(opaque: string): Promise<boolean> {
  const tokenHash = hashSessionCookieOpaque(opaque);
  const row = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });
  return Boolean(row);
}

export async function revokeDbSessionByOpaqueCookie(opaque: string): Promise<void> {
  if (!isOpaqueSessionCookieValue(opaque)) {
    return;
  }
  const tokenHash = hashSessionCookieOpaque(opaque);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export function adminSessionCookieMaxAgeSec(): number {
  return Math.floor(SESSION_MAX_MS / 1000);
}
