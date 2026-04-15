import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { hashPasswordForStorage, verifyPasswordAgainstHash } from '@/server/admin/passwordScrypt';

describe('passwordScrypt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips password verification', async () => {
    const stored = await hashPasswordForStorage('correct-horse-battery-staple');
    expect(await verifyPasswordAgainstHash('correct-horse-battery-staple', stored)).toBe(true);
    expect(await verifyPasswordAgainstHash('wrong', stored)).toBe(false);
  });

  it('rejects unknown storage formats', async () => {
    expect(await verifyPasswordAgainstHash('x', 'plaintext-nope')).toBe(false);
    expect(await verifyPasswordAgainstHash('x', 'scrypt19$bad')).toBe(false);
  });
});
