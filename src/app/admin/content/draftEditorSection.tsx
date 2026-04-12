'use client';

import React, { useEffect, useRef, useState } from 'react';

import type { SiteContent } from '@/content/schema';
import {
  type DraftEditorSlice,
  extractEditorSliceFromSiteContent,
  validateEditorSliceClient,
} from '@/lib/draftEditorSlice';

import { DraftEditorCareerAwardsForm } from './draftEditorCareerAwardsForm';
import { DraftEditorFormBody } from './draftEditorFormBody';
import { DraftEditorSaveBar } from './draftEditorSaveBar';

export type DraftEditorSectionProps = {
  /** When null, editor is hidden (no draft or invalid payload). */
  workingCopy: SiteContent | null;
  /** Bump when server draft updates so local fields reset from server. */
  resetKey: string;
  loadError: string | null;
  disabled: boolean;
  saving: boolean;
  saveChangeSummary: string;
  onSaveChangeSummaryChange: (v: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  /** False until the user edits a field (server baseline unchanged). */
  allowSave: boolean;
  onSave: (slice: DraftEditorSlice) => void;
};

export function DraftEditorSection({
  workingCopy,
  resetKey,
  loadError,
  disabled,
  saving,
  saveChangeSummary,
  onSaveChangeSummaryChange,
  onDirtyChange,
  allowSave,
  onSave,
}: DraftEditorSectionProps) {
  const [slice, setSlice] = useState<DraftEditorSlice | null>(null);
  const dirtyCb = useRef(onDirtyChange);
  dirtyCb.current = onDirtyChange;

  useEffect(() => {
    if (!workingCopy) {
      setSlice(null);
      dirtyCb.current(false);
      return;
    }
    setSlice(extractEditorSliceFromSiteContent(workingCopy));
    dirtyCb.current(false);
  }, [workingCopy, resetKey]);

  if (loadError) {
    return (
      <section className="card p-6 mb-6 border-warning/40">
        <h2 className="text-lg font-semibold text-foreground mb-2">Draft editor</h2>
        <p className="text-error text-sm">{loadError}</p>
      </section>
    );
  }

  if (!workingCopy || !slice) {
    return null;
  }

  const markDirty = () => {
    dirtyCb.current(true);
  };

  const patchProfile = (p: Partial<DraftEditorSlice['profile']>) => {
    setSlice((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, profile: { ...prev.profile, ...p } };
    });
    markDirty();
  };

  const patchContact = (p: Partial<DraftEditorSlice['contact']>) => {
    setSlice((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, contact: { ...prev.contact, ...p } };
    });
    markDirty();
  };

  const setSummaryText = (aboutProfessionalSummaryText: string) => {
    setSlice((prev) => (prev ? { ...prev, aboutProfessionalSummaryText } : prev));
    markDirty();
  };

  const replaceStructuredSlice = (next: DraftEditorSlice) => {
    setSlice(next);
    markDirty();
  };

  const handleSaveClick = () => {
    if (!slice || disabled || saving) {
      return;
    }
    const client = validateEditorSliceClient(slice);
    if (!client.ok) {
      return;
    }
    onSave(slice);
  };

  const clientErr = validateEditorSliceClient(slice);
  const canSave = clientErr.ok === true && allowSave && !disabled && !saving;

  return (
    <section className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-2">Draft editor</h2>
      <p className="text-muted text-sm mb-6">
        Profile, summary, contact, academic journey, professional appointments, and awards. Publications and patents
        stay unchanged here.
      </p>

      <DraftEditorFormBody
        slice={slice}
        disabled={disabled}
        saving={saving}
        patchProfile={patchProfile}
        patchContact={patchContact}
        setSummaryText={setSummaryText}
      />

      <DraftEditorCareerAwardsForm slice={slice} disabled={disabled} onSliceChange={replaceStructuredSlice} />

      <DraftEditorSaveBar
        disabled={disabled}
        saving={saving}
        saveChangeSummary={saveChangeSummary}
        onSaveChangeSummaryChange={onSaveChangeSummaryChange}
        clientErr={clientErr}
        canSave={canSave}
        onSaveClick={handleSaveClick}
      />
    </section>
  );
}
