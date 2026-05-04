import { describe, expect, it } from 'vitest';

import {
  buildStructuredContactMessage,
  buildWeb3FormsContactPayload,
  WEB3FORMS_FROM_NAME_MAX,
  WEB3FORMS_SUBJECT_MAX,
} from '@/lib/web3formsContactEmail';

describe('buildStructuredContactMessage', () => {
  it('includes visitor fields and ISO timestamp pattern', () => {
    const text = buildStructuredContactMessage(
      {
        name: 'Test User',
        email: 'user@example.com',
        subject: 'Collaboration',
        message: 'Hello there, this is my message body.',
      },
      { siteBrand: 'Example Lab', pageUrl: 'https://example.com/contact' },
    );
    expect(text).toContain('Test User');
    expect(text).toContain('user@example.com');
    expect(text).toContain('Collaboration');
    expect(text).toContain('Hello there, this is my message body.');
    expect(text).toContain('https://example.com/contact');
    expect(text).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});

describe('buildWeb3FormsContactPayload', () => {
  it('keeps subject within max length', () => {
    const longSubject = 'S'.repeat(300);
    const p = buildWeb3FormsContactPayload({
      accessKey: 'key',
      fields: {
        name: 'Ada',
        email: 'ada@example.com',
        subject: longSubject,
        message: 'Enough text here for validation.',
      },
      siteBrand: 'My Academic Site Name',
      pageUrl: 'https://x.com/contact',
    });
    expect(p.subject.length).toBeLessThanOrEqual(WEB3FORMS_SUBJECT_MAX);
    expect(p.subject.startsWith('[Contact] ')).toBe(true);
  });

  it('keeps from_name within max length', () => {
    const p = buildWeb3FormsContactPayload({
      accessKey: 'key',
      fields: {
        name: 'A'.repeat(100),
        email: 'a@b.co',
        subject: 'Hi',
        message: '1234567890 message body ok.',
      },
      siteBrand: 'B'.repeat(80),
      pageUrl: 'https://x.com/c',
    });
    expect(p.from_name.length).toBeLessThanOrEqual(WEB3FORMS_FROM_NAME_MAX);
    expect(p.replyto).toBe('a@b.co');
    expect(p.email).toBe('a@b.co');
  });
});
