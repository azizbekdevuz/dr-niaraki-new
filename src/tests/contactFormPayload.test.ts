import { describe, expect, it } from 'vitest';

import { contactFormFieldSchema } from '@/lib/contactFormPayload';

describe('contactFormFieldSchema', () => {
  it('accepts a normal payload', () => {
    const r = contactFormFieldSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'This is at least ten chars.',
    });
    expect(r.success).toBe(true);
  });

  it('rejects short messages', () => {
    const r = contactFormFieldSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hi',
      message: 'short',
    });
    expect(r.success).toBe(false);
  });

  it('trims strings', () => {
    const r = contactFormFieldSchema.safeParse({
      name: '  Ada  ',
      email: '  ada@example.com  ',
      subject: '  Sub  ',
      message: '  Enough characters here.  ',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe('Ada');
      expect(r.data.email).toBe('ada@example.com');
    }
  });
});
