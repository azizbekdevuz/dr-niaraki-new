import 'server-only';

import { hashPasswordForStorage, verifyPasswordAgainstHash } from '@/server/admin/passwordScrypt';
import { prisma } from '@/server/db/prisma';

function primaryAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'admin@localhost').trim();
}

function envBootstrapPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw || !raw.trim()) {
    return null;
  }
  return raw;
}

/**
 * Ensures a single primary admin row exists when `ADMIN_PASSWORD` is set:
 * creates the user with a scrypt hash, or fills `passwordHash` if it was null.
 * Runtime login verification uses DB hash only (no plaintext compare).
 */
export async function ensureBootstrapAdminUser(): Promise<void> {
  const password = envBootstrapPassword();
  if (!password) {
    return;
  }
  const email = primaryAdminEmail();
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash: await hashPasswordForStorage(password),
      },
    });
    return;
  }
  if (!existing.passwordHash) {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { passwordHash: await hashPasswordForStorage(password) },
    });
  }
}

export async function authenticateAdminPassword(
  password: string
): Promise<{ ok: true; adminUserId: string } | { ok: false }> {
  await ensureBootstrapAdminUser();
  const email = primaryAdminEmail();
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    if (envBootstrapPassword()) {
      console.warn(
        'ADMIN_PASSWORD is set but AdminUser.passwordHash is missing after bootstrap; check database connectivity.'
      );
    } else {
      console.warn('Admin login: no AdminUser password hash and ADMIN_PASSWORD is not set.');
    }
    return { ok: false };
  }
  const valid = await verifyPasswordAgainstHash(password, user.passwordHash);
  return valid ? { ok: true, adminUserId: user.id } : { ok: false };
}
