'use client';

import { Check, Loader2 } from 'lucide-react';
import React from 'react';

type Props = {
  warningsCount: number;
  validationErrorsCount: number;
  acknowledgeWarnings: boolean;
  onAcknowledgeChange: (checked: boolean) => void;
  committing: boolean;
  canCommit: boolean;
  onStartOver: () => void;
  onCommit: () => void;
};

export function CvCommitCard({
  warningsCount,
  validationErrorsCount,
  acknowledgeWarnings,
  onAcknowledgeChange,
  committing,
  canCommit,
  onStartOver,
  onCommit,
}: Props) {
  const needsAck = warningsCount > 0 || validationErrorsCount > 0;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Confirm & Commit</h3>

      {needsAck ? (
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledgeWarnings}
            onChange={(e) => onAcknowledgeChange(e.target.checked)}
            className="w-5 h-5 rounded border-primary bg-surface-secondary text-accent-primary focus:ring-accent-primary"
          />
          <span className="text-sm text-muted">
            I have reviewed and accept the {warningsCount} warning(s) and {validationErrorsCount} validation issue(s)
          </span>
        </label>
      ) : null}

      <div className="flex gap-4">
        <button type="button" onClick={onStartOver} className="btn-secondary px-6 py-3">
          Start Over
        </button>
        <button
          type="button"
          onClick={() => void onCommit()}
          disabled={committing || !canCommit}
          className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          {committing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Committing...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Commit to GitHub</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
