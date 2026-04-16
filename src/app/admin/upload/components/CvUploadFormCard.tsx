'use client';

import { FileText, Loader2, Upload } from 'lucide-react';
import React from 'react';

type Props = {
  file: File | null;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
};

export function CvUploadFormCard({ file, uploading, onFileChange, onUpload }: Props) {
  return (
    <div className="card p-8 text-center">
      <div className="max-w-md mx-auto">
        <FileText className="w-16 h-16 mx-auto mb-4 text-accent-primary opacity-50" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Upload DOCX File</h2>
        <p className="text-muted text-sm mb-6">Select a .docx file containing the CV to parse and update the site data.</p>

        <input type="file" accept=".docx" onChange={onFileChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="inline-block btn-secondary px-6 py-3 cursor-pointer mb-4">
          Choose File
        </label>

        {file ? (
          <div className="mb-4">
            <p className="text-foreground font-medium">{file.name}</p>
            <p className="text-muted text-sm">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void onUpload()}
          disabled={!file || uploading}
          className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Parsing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload & Parse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
