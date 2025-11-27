'use client';

/**
 * Admin uploads history page
 */

import {
  History,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
  FileText,
  Calendar,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import type { UploadHistoryItem } from '@/types/admin';

export default function AdminHistoryPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load uploads history
  useEffect(() => {
    async function loadData() {
      try {
        // Check auth status
        const statusRes = await fetch('/api/admin/status');
        const statusData = await statusRes.json();
        
        if (!statusData.isLoggedIn) {
          router.push('/admin');
          return;
        }

        // Load uploads
        const uploadsRes = await fetch('/api/admin/uploads');
        const uploadsData = await uploadsRes.json();
        
        if (uploadsData.success) {
          setUploads(uploadsData.uploads);
        }
      } catch {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/uploads?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setUploads(uploads.filter((u) => u.filename !== filename));
      } else {
        setError(data.message || 'Failed to delete file');
      }
    } catch {
      setError('Failed to connect to server');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch {
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/admin/upload"
              className="p-2 text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <History className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Upload History</h1>
              <p className="text-muted text-sm">View and manage previously uploaded files</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Uploads List */}
        <div className="card p-6">
          {uploads.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No uploads yet</p>
              <p className="text-sm mt-2">Upload a DOCX file to get started</p>
              <a href="/admin/upload" className="btn-primary inline-flex mt-6 px-6 py-3">
                Upload File
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div
                  key={upload.filename}
                  className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{upload.originalName}</p>
                      <div className="flex items-center gap-3 text-muted text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </span>
                        <span>{(upload.fileSizeBytes / 1024).toFixed(1)} KB</span>
                        {upload.warnings.length > 0 && (
                          <span className="text-warning">{upload.warnings.length} warnings</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={upload.downloadUrl}
                      download
                      className="p-2 text-muted hover:text-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(upload.filename)}
                      className="p-2 text-muted hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rollback Instructions */}
        <div className="card p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Rollback Instructions</h2>
          <div className="text-sm text-muted space-y-4">
            <p>
              If you need to revert changes made by a commit, you can do so manually through GitHub:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the GitHub repository</li>
              <li>Navigate to the commit history</li>
              <li>Find the commit you want to revert (the commit SHA is shown after each upload)</li>
              <li>Click the commit and use the &quot;Revert&quot; button, or use git CLI</li>
            </ol>
            <p className="text-xs text-muted/70">
              Note: Deleting a file from this list only removes the local backup, not the committed changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
