import { describe, expect, it } from 'vitest';

import { validateChatInput, validateSessionId, sanitizeOutput } from '@/lib/input-validation';

describe('validateChatInput', () => {
  it('accepts normal text', () => {
    const r = validateChatInput('What is your research about?');
    expect(r.isValid).toBe(true);
    expect(r.sanitized).toBe('What is your research about?');
  });

  it('rejects empty input', () => {
    expect(validateChatInput('').isValid).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(validateChatInput(42).isValid).toBe(false);
    expect(validateChatInput(null).isValid).toBe(false);
  });

  it('rejects input exceeding 1000 characters', () => {
    expect(validateChatInput('a'.repeat(1001)).isValid).toBe(false);
  });

  it('rejects <script> tags regardless of closing tag shape', () => {
    expect(validateChatInput('<script>alert(1)</script>').isValid).toBe(false);
    expect(validateChatInput('<script>alert(1)</script >').isValid).toBe(false);
    expect(validateChatInput('<script>x</script foo="bar">').isValid).toBe(false);
    expect(validateChatInput('<SCRIPT>alert(1)</SCRIPT>').isValid).toBe(false);
    expect(validateChatInput('<script src="x.js">').isValid).toBe(false);
  });

  it('rejects iframe tags', () => {
    expect(validateChatInput('<iframe src="x"></iframe>').isValid).toBe(false);
    expect(validateChatInput('<iframe src="x"></iframe >').isValid).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(validateChatInput('javascript:alert(1)').isValid).toBe(false);
  });

  it('rejects event handler attributes', () => {
    expect(validateChatInput('onclick=alert(1)').isValid).toBe(false);
    expect(validateChatInput('onmouseover =doEvil()').isValid).toBe(false);
  });

  it('does not false-positive on normal use of "on"', () => {
    expect(validateChatInput('I am working on a research paper').isValid).toBe(true);
    expect(validateChatInput('Based on the findings').isValid).toBe(true);
  });

  it('completes quickly on repeated "on" strings (no ReDoS)', () => {
    const start = performance.now();
    validateChatInput('on'.repeat(500));
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe('validateSessionId', () => {
  it('accepts valid session IDs', () => {
    expect(validateSessionId('session_1714900000000')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(validateSessionId('invalid')).toBe(false);
    expect(validateSessionId(123)).toBe(false);
    expect(validateSessionId(null)).toBe(false);
  });
});

describe('sanitizeOutput', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeOutput('<b>"Hello" & \'World\'</b>')).toBe(
      '&lt;b&gt;&quot;Hello&quot; &amp; &#039;World&#039;&lt;/b&gt;',
    );
  });
});
