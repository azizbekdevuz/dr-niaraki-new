import type { ContactFormFields } from '@/lib/contactFormPayload';

/** Typical client display-name limit; keeps notifications readable. */
export const WEB3FORMS_FROM_NAME_MAX = 78;
export const WEB3FORMS_SUBJECT_MAX = 200;

function truncateEnd(value: string, max: number): string {
  const t = value.trim();
  if (t.length <= max) {
    return t;
  }
  if (max <= 1) {
    return '…';
  }
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Plain-text body that reads clearly in Gmail / Outlook / phone mail.
 * (Web3Forms free tier emails are essentially this string — no HTML template.)
 */
export function buildStructuredContactMessage(
  fields: ContactFormFields,
  ctx: { siteBrand: string; pageUrl: string },
): string {
  const { name, email, subject, message } = fields;
  const when = new Date().toISOString();
  const brand = ctx.siteBrand.trim() || 'Website';

  return [
    `New contact form message — ${brand}`,
    '',
    '────────────────────────────────────────',
    'SOURCE',
    '────────────────────────────────────────',
    `Page:     ${ctx.pageUrl || '(not available)'}`,
    `Sent UTC: ${when}`,
    '',
    '────────────────────────────────────────',
    'VISITOR',
    '────────────────────────────────────────',
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Subject:  ${subject}`,
    '',
    '────────────────────────────────────────',
    'MESSAGE',
    '────────────────────────────────────────',
    '',
    message.trim(),
    '',
    '────────────────────────────────────────',
    'Reply to this person using your mail client\'s Reply — the From line is labelled for quick scanning.',
  ].join('\n');
}

/**
 * Web3Forms JSON fields: subject / from_name / replyto shape what you see in the inbox;
 * arbitrary keys are also echoed in the notification email (free tier).
 */
export type Web3FormsContactPayload = {
  access_key: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  replyto: string;
  from_name: string;
  form_type: string;
};

export function buildWeb3FormsContactPayload(input: {
  accessKey: string;
  fields: ContactFormFields;
  siteBrand: string;
  pageUrl: string;
}): Web3FormsContactPayload {
  const brand = truncateEnd(input.siteBrand, 60) || 'Website';
  const structuredMessage = buildStructuredContactMessage(input.fields, {
    siteBrand: brand,
    pageUrl: input.pageUrl.trim(),
  });

  const visitorSubject = input.fields.subject.trim();
  const subjectCore = `[Contact] ${visitorSubject}`;
  const subjectTail = ` — ${brand}`;
  let subject = `${subjectCore}${subjectTail}`;
  if (subject.length > WEB3FORMS_SUBJECT_MAX) {
    const budget = WEB3FORMS_SUBJECT_MAX - `[Contact] `.length - subjectTail.length;
    subject = `[Contact] ${truncateEnd(visitorSubject, Math.max(12, budget))}${subjectTail}`;
    if (subject.length > WEB3FORMS_SUBJECT_MAX) {
      subject = truncateEnd(subject, WEB3FORMS_SUBJECT_MAX);
    }
  }

  const visitorName = input.fields.name.trim();
  const fromNameCandidate = `${visitorName} · ${brand}`;
  const from_name = truncateEnd(fromNameCandidate, WEB3FORMS_FROM_NAME_MAX);

  const email = input.fields.email.trim();

  return {
    access_key: input.accessKey,
    name: visitorName,
    email,
    subject,
    message: structuredMessage,
    replyto: email,
    from_name,
    form_type: 'Website contact form',
  };
}
