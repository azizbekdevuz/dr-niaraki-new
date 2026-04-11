'use client';

/**
 * Single import review: warnings, summary, section comparison, merge-to-draft (create or replace).
 */

import { Loader2, Package } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { ImportDetailBody, type ImportDetailModel, type ReviewPayloadModel } from '../importDetailBody';

export default function AdminImportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imp, setImp] = useState<ImportDetailModel | null>(null);
  const [review, setReview] = useState<ReviewPayloadModel | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeMsg, setMergeMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    setMergeMsg(null);
    try {
      const statusRes = await fetch('/api/admin/status', { credentials: 'include' });
      const statusData = await statusRes.json();
      if (!statusData.isLoggedIn) {
        router.push('/admin');
        return;
      }
      if (!statusData.hasValidDevice) {
        router.push('/admin/devices');
        return;
      }
      const [revRes, draftRes] = await Promise.all([
        fetch(`/api/admin/imports/${id}/review`, { credentials: 'include' }),
        fetch('/api/admin/content/draft', { credentials: 'include' }),
      ]);
      const revJson = await revRes.json();
      if (!revRes.ok || !revJson.ok) {
        setError(revJson.message || revJson.error || 'Failed to load import');
        return;
      }
      setImp(revJson.import as ImportDetailModel);
      setReview(revJson.review as ReviewPayloadModel);
      const dJson = await draftRes.json();
      setHasDraft(Boolean(dJson.ok && dJson.draft));
    } catch {
      setError('Failed to load import');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const merge = useCallback(
    async (action: 'create' | 'replace') => {
      setMerging(true);
      setMergeMsg(null);
      setError(null);
      try {
        const res = await fetch(`/api/admin/imports/${id}/merge-to-draft`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.message || data.error || 'Merge failed');
          return;
        }
        setError(null);
        setMergeMsg('Draft updated. Open Site content to review and publish separately.');
        await load();
      } catch {
        setMergeMsg('Merge request failed');
      } finally {
        setMerging(false);
      }
    },
    [id, load],
  );

  if (loading || !imp) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-8 max-w-5xl mx-auto">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Import review</h1>
            <p className="text-muted text-sm">{imp.originalFileName}</p>
            <p className="text-xs text-muted mt-1">
              Status: <span className="text-foreground">{imp.status}</span> · Baseline:{' '}
              {review?.baselineSource ?? '—'}
            </p>
          </div>
        </div>
      </div>
      <ImportDetailBody
        imp={imp}
        review={review}
        hasDraft={hasDraft}
        merging={merging}
        mergeMsg={mergeMsg}
        error={error}
        onMerge={(a) => void merge(a)}
      />
    </div>
  );
}
