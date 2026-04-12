'use client';

import { Loader2, Save } from 'lucide-react';
import React from 'react';

type DraftEditorSaveBarProps = {
  disabled: boolean;
  saving: boolean;
  saveChangeSummary: string;
  onSaveChangeSummaryChange: (v: string) => void;
  clientErr: { ok: false; message: string } | { ok: true };
  canSave: boolean;
  onSaveClick: () => void;
};

export function DraftEditorSaveBar({
  disabled,
  saving,
  saveChangeSummary,
  onSaveChangeSummaryChange,
  clientErr,
  canSave,
  onSaveClick,
}: DraftEditorSaveBarProps) {
  const off = disabled || saving;

  return (
    <div className="border-t border-primary pt-6 mt-6">
      <label className="block mb-4">
        <span className="text-xs text-muted block mb-1">Save note (optional)</span>
        <input
          value={saveChangeSummary}
          onChange={(e) => onSaveChangeSummaryChange(e.target.value)}
          disabled={off}
          placeholder="e.g. Updated appointments and awards"
          className="w-full max-w-xl px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm"
        />
      </label>
      {clientErr.ok === false ? <p className="text-error text-xs mb-3">{clientErr.message}</p> : null}
      <button
        type="button"
        onClick={onSaveClick}
        disabled={!canSave}
        className="btn-primary px-6 py-2 inline-flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>Save draft to server</span>
      </button>
    </div>
  );
}
