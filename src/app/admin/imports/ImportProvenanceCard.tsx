'use client';

import React from 'react';

import { VERCEL_BLOB_STORED_PREFIX } from '@/lib/storagePathMarkers';

import type { ImportReviewProvenanceModel } from './importDetailTypes';

export function ImportProvenanceCard({ provenance }: { provenance: ImportReviewProvenanceModel }) {
  const isBlob = provenance.storedPath.startsWith(VERCEL_BLOB_STORED_PREFIX);
  return (
    <div className="card p-4 space-y-1 text-sm">
      <p className="font-medium text-foreground">Import provenance</p>
      <ul className="text-xs text-muted list-none space-y-0.5">
        <li>Import id: {provenance.importId}</li>
        <li>Original file: {provenance.originalFileName}</li>
        <li className="break-all">Stored path: {provenance.storedPath}</li>
        {isBlob ? (
          <li className="text-foreground/90">
            File bytes live in private Vercel Blob; download from upload history uses an authenticated admin route.
          </li>
        ) : null}
        <li>UploadedFile id: {provenance.uploadedFileId}</li>
      </ul>
    </div>
  );
}
