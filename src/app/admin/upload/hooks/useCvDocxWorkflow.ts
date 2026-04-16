'use client';

import { useCallback, useState } from 'react';

import type { Details } from '@/types/details';

import type { CvPreviewTabId } from '../uploadTypes';

type RouterLike = { push: (href: string) => void };

export function useCvDocxWorkflow(router: RouterLike) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [parsedData, setParsedData] = useState<Details | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [activeTab, setActiveTab] = useState<CvPreviewTabId>('profile');

  const [commitSha, setCommitSha] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);
  const [commitDomainNote, setCommitDomainNote] = useState<string | null>(null);
  const [uploadMetaNote, setUploadMetaNote] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Only .docx files are supported');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setParsedData(null);
      setWarnings([]);
      setValidationErrors([]);
      setCommitSha(null);
      setCommitUrl(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setParsedData(data.data);
        setWarnings(data.warnings || []);
        setValidationErrors(data.validation?.errors || []);
        setUploadMetaNote(typeof data.legacyUploadMetaNote === 'string' ? data.legacyUploadMetaNote : null);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file]);

  const handleCommit = useCallback(async () => {
    if (!parsedData) {
      return;
    }

    setCommitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: parsedData,
          acknowledgeWarnings,
          originalFilename: file?.name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCommitDomainNote(typeof data.importDomainNote === 'string' ? data.importDomainNote : null);
        if (data.commitSha) {
          setCommitSha(data.commitSha);
          setCommitUrl(data.commitUrl);
          setSuccess(
            data.legacyDetailsJsonCommit
              ? 'Legacy JSON commit completed (GitHub). This does not update the live DB-backed site by itself — use Imports → merge → publish for the modern path.'
              : 'Data committed successfully! Vercel will auto-deploy.',
          );
        } else {
          setSuccess(data.message);
        }
      } else {
        setError(data.message || 'Commit failed');
      }
    } catch {
      setError('Failed to commit changes');
    } finally {
      setCommitting(false);
    }
  }, [parsedData, acknowledgeWarnings, file]);

  const startOver = useCallback(() => {
    setParsedData(null);
    setFile(null);
    setWarnings([]);
    setValidationErrors([]);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch {
      setError('Failed to logout');
    }
  }, [router]);

  return {
    file,
    handleFileChange,
    uploading,
    parsedData,
    warnings,
    validationErrors,
    acknowledgeWarnings,
    setAcknowledgeWarnings,
    activeTab,
    setActiveTab,
    handleUpload,
    handleCommit,
    committing,
    startOver,
    error,
    success,
    commitSha,
    commitUrl,
    commitDomainNote,
    uploadMetaNote,
    handleLogout,
  };
}
