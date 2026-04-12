'use client';

import React from 'react';

import type { DraftEditorSlice } from '@/lib/draftEditorSlice';

const fieldClass =
  'w-full px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm';

type DraftEditorFormBodyProps = {
  slice: DraftEditorSlice;
  disabled: boolean;
  saving: boolean;
  patchProfile: (p: Partial<DraftEditorSlice['profile']>) => void;
  patchContact: (p: Partial<DraftEditorSlice['contact']>) => void;
  setSummaryText: (t: string) => void;
};

export function DraftEditorFormBody({
  slice,
  disabled,
  saving,
  patchProfile,
  patchContact,
  setSummaryText,
}: DraftEditorFormBodyProps) {
  const off = disabled || saving;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Display name</span>
            <input
              value={slice.profile.displayName}
              onChange={(e) => patchProfile({ displayName: e.target.value })}
              disabled={off}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Role / title line</span>
            <input
              value={slice.profile.roleLine}
              onChange={(e) => patchProfile({ roleLine: e.target.value })}
              disabled={off}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Home intro (short summary)</span>
            <textarea
              value={slice.profile.homeAboutIntro}
              onChange={(e) => patchProfile({ homeAboutIntro: e.target.value })}
              disabled={off}
              rows={3}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">About tagline / longer summary</span>
            <textarea
              value={slice.profile.aboutIntroTagline}
              onChange={(e) => patchProfile({ aboutIntroTagline: e.target.value })}
              disabled={off}
              rows={4}
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3">About — professional summary</h3>
        <p className="text-xs text-muted mb-2">Separate paragraphs with a blank line.</p>
        <textarea
          value={slice.aboutProfessionalSummaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          disabled={off}
          rows={10}
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Official email</span>
            <input
              type="email"
              value={slice.contact.email}
              onChange={(e) => patchContact({ email: e.target.value })}
              disabled={off}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Personal email</span>
            <input
              type="email"
              value={slice.contact.personalEmail}
              onChange={(e) => patchContact({ personalEmail: e.target.value })}
              disabled={off}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted block mb-1">Website (display text)</span>
            <input
              value={slice.contact.websiteDisplay}
              onChange={(e) => patchContact({ websiteDisplay: e.target.value })}
              disabled={off}
              className={fieldClass}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
