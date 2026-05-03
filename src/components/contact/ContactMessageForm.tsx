'use client';

/**
 * Sends messages via Web3Forms (free tier: browser POST only — see https://web3forms.com).
 * Set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY from the dashboard after email verification.
 */

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { contactFormFieldSchema, type ContactFormFields } from '@/lib/contactFormPayload';
import { buildWeb3FormsContactPayload } from '@/lib/web3formsContactEmail';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

type Web3FormsJson = {
  success?: boolean;
  message?: string;
  body?: { message?: string };
};

function readWeb3FormsError(data: Web3FormsJson): string {
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  const inner = data.body?.message;
  if (typeof inner === 'string' && inner.trim()) {
    return inner.trim();
  }
  return 'Something went wrong. Please try again or use email below.';
}

export type ContactMessageFormProps = {
  /** Primary inbox for direct-mail fallback copy */
  directEmail: string;
  /** Used in email subject / From display (e.g. `meta.openGraphSiteName`) */
  siteBrand: string;
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ContactMessageForm({ directEmail, siteBrand }: ContactMessageFormProps) {
  const accessKey = useMemo(
    () => (typeof process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY === 'string'
      ? process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.trim()
      : ''),
    [],
  );

  const [formData, setFormData] = useState<ContactFormFields>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  /** Honeypot — bots often autofill; humans should never see this field. */
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormFields, string>>>({});

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      if (trap.trim()) {
        setError('Unable to send this message.');
        return;
      }

      if (!accessKey) {
        setError(
          'The message form is not configured yet. Please use the email address on the left.',
        );
        return;
      }

      const parsed = contactFormFieldSchema.safeParse(formData);
      if (!parsed.success) {
        const next: Partial<Record<keyof ContactFormFields, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0];
          if (key === 'name' || key === 'email' || key === 'subject' || key === 'message') {
            if (!next[key]) {
              next[key] = issue.message;
            }
          }
        }
        setFieldErrors(next);
        return;
      }

      setSending(true);
      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

        const payload = buildWeb3FormsContactPayload({
          accessKey,
          fields: parsed.data,
          siteBrand,
          pageUrl,
        });

        const res = await fetch(WEB3FORMS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });

        let data: Web3FormsJson = {};
        try {
          data = (await res.json()) as Web3FormsJson;
        } catch {
          setError('Unexpected response from the form service. Try again or email directly.');
          return;
        }

        if (!res.ok || data.success !== true) {
          setError(readWeb3FormsError(data));
          return;
        }

        setSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTrap('');
      } catch {
        setError('Network error. Check your connection, or email directly using the address on the left.');
      } finally {
        setSending(false);
      }
    },
    [accessKey, formData, siteBrand, trap],
  );

  return (
    <motion.div variants={itemVariants}>
      <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>

      <div className="card p-6">
        {sent ? (
          <div className="text-center py-10">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" aria-hidden />
            <h3 className="text-xl font-semibold text-foreground mb-2">Message delivered</h3>
            <p className="text-muted mb-2 max-w-md mx-auto">
              Your note was submitted successfully. If a reply is needed, it will go to the address you entered.
            </p>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              For urgent matters, you can still reach out directly at{' '}
              <a href={`mailto:${directEmail}`} className="text-accent-primary hover:underline">
                {directEmail}
              </a>
              .
            </p>
            <button type="button" onClick={() => setSent(false)} className="btn-secondary px-6 py-2">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-6" noValidate>
            {!accessKey ? (
              <div
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
                role="status"
              >
                <p className="font-medium text-amber-200/90">Form not connected</p>
                <p className="mt-1 text-muted">
                  Add a free Web3Forms key as <code className="text-foreground/90">NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY</code>{' '}
                  (from{' '}
                  <a
                    href="https://web3forms.com"
                    className="text-accent-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    web3forms.com
                  </a>
                  ) to enable delivery. Until then, use{' '}
                  <a href={`mailto:${directEmail}`} className="text-accent-primary hover:underline">
                    {directEmail}
                  </a>
                  .
                </p>
              </div>
            ) : null}

            <div className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="contact-form-trap">Company website</label>
              <input
                id="contact-form-trap"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                  required
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name ? (
                  <p id="name-error" className="mt-1 text-xs text-error">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email ? (
                  <p id="email-error" className="mt-1 text-xs text-error">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-secondary mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                required
                aria-invalid={Boolean(fieldErrors.subject)}
                aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
              />
              {fieldErrors.subject ? (
                <p id="subject-error" className="mt-1 text-xs text-error">
                  {fieldErrors.subject}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-secondary mb-2">
                Message *
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground resize-none"
                required
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'message-error' : undefined}
              />
              {fieldErrors.message ? (
                <p id="message-error" className="mt-1 text-xs text-error">
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>

            {error ? (
              <div className="flex flex-col gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
                {!accessKey ? (
                  <a href={`mailto:${directEmail}?subject=${encodeURIComponent('Website inquiry')}`} className="font-medium underline">
                    Open email to {directEmail}
                  </a>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={sending}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden />
                  <span>Send message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-4 text-muted text-sm text-center">
        For urgent matters, please contact via email directly.
      </p>
    </motion.div>
  );
}
