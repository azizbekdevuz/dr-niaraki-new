import 'server-only';

import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/** Prefix for scrypt-based password hashes stored on `AdminUser.passwordHash`. */
const STORED_PREFIX = 'scrypt19$';

function splitStoredHash(stored: string): { salt: Buffer; hash: Buffer } | null {
  if (!stored.startsWith(STORED_PREFIX)) {
    return null;
  }
  const rest = stored.slice(STORED_PREFIX.length);
  const parts = rest.split('$');
  if (parts.length !== 2) {
    return null;
  }
  const saltHex = parts[0];
  const hashHex = parts[1];
  if (!saltHex || !hashHex || !/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) {
    return null;
  }
  try {
    return { salt: Buffer.from(saltHex, 'hex'), hash: Buffer.from(hashHex, 'hex') };
  } catch {
    return null;
  }
}

export async function hashPasswordForStorage(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
  return `${STORED_PREFIX}${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPasswordAgainstHash(plain: string, stored: string): Promise<boolean> {
  const parsed = splitStoredHash(stored);
  if (!parsed) {
    return false;
  }
  const derived = (await scryptAsync(plain, parsed.salt, 64)) as Buffer;
  if (derived.length !== parsed.hash.length) {
    return false;
  }
  return timingSafeEqual(derived, parsed.hash);
}
