'use client';

import React from 'react';

import type { ImportDetailModel } from './importDetailTypes';

type Props = {
  imp: ImportDetailModel;
  hasDraft: boolean;
  merging: boolean;
  onMerge: (action: 'create' | 'replace') => void;
};

export function ImportMergeDraftCard({ imp, hasDraft, merging, onMerge }: Props) {
  return (
    <div className="card p-4 space-y-3">
      <p className="font-medium text-foreground">Merge into working draft</p>
      <p className="text-xs text-muted">
        Creates or replaces the <strong>working draft</strong> only. Does not publish. Imports already merged cannot
        merge again. If a draft already exists, use <strong>Replace</strong> only when you intend to overwrite the whole
        draft payload.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={merging || hasDraft || imp.status === 'MERGED'}
          onClick={() => onMerge('create')}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
        >
          Create draft from import
        </button>
        <button
          type="button"
          disabled={merging || !hasDraft || imp.status === 'MERGED'}
          onClick={() => onMerge('replace')}
          className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
        >
          Replace current draft
        </button>
      </div>
      {!hasDraft ? (
        <p className="text-xs text-muted">No working draft yet — use &quot;Create&quot; first.</p>
      ) : (
        <p className="text-xs text-muted">
          A draft exists — &quot;Replace&quot; overwrites the working draft with the mapped import (still not published).
        </p>
      )}
    </div>
  );
}
