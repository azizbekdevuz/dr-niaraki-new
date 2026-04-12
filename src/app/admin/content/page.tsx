'use client';

/**
 * Admin site content workflow: draft metadata, narrow draft editor, publish, versions.
 * Uses `/api/admin/content/*` only — workflow rules stay on the server.
 */

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import type { SiteContent } from '@/content/schema';
import { validateSiteContent } from '@/content/validators';
import {
  fetchContentDraft,
  fetchContentVersions,
  formatWorkflowError,
  postBootstrapDraft,
  postPublishDraft,
  postRestoreVersion,
  putSaveDraft,
  type ContentVersionRow,
  type LatestPublishedMeta,
  type PublicLiveReadSummaryDto,
} from '@/lib/adminContentWorkflowClient';
import { mergeEditorSliceIntoSiteContent, type DraftEditorSlice } from '@/lib/draftEditorSlice';

import { DraftEditorSection } from './draftEditorSection';
import { ContentWorkflowSections } from './workflowSections';

export default function AdminContentWorkflowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [draft, setDraft] = useState<ContentVersionRow | null>(null);
  const [latestPublished, setLatestPublished] = useState<LatestPublishedMeta | null>(null);
  const [publicLiveRead, setPublicLiveRead] = useState<PublicLiveReadSummaryDto | null>(null);
  const [publicContentAuthority, setPublicContentAuthority] = useState<string>('db_first_canonical_fallback');
  const [publicContentAuthorityDetail, setPublicContentAuthorityDetail] = useState<string>('');
  const [versions, setVersions] = useState<ContentVersionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishLabel, setPublishLabel] = useState('');
  const [publishSummary, setPublishSummary] = useState('');
  const [restoreNote, setRestoreNote] = useState('');
  const [workingCopy, setWorkingCopy] = useState<SiteContent | null>(null);
  const [editorLoadError, setEditorLoadError] = useState<string | null>(null);
  const [saveChangeSummary, setSaveChangeSummary] = useState('');
  const [editorDirty, setEditorDirty] = useState(false);

  const refreshWorkflow = useCallback(async () => {
    setSyncing(true);
    const dRes = await fetchContentDraft();
    if (!dRes.success) {
      setError(formatWorkflowError(dRes));
      setDraft(null);
      setLatestPublished(null);
      setPublicLiveRead(null);
      setPublicContentAuthority('db_first_canonical_fallback');
      setPublicContentAuthorityDetail('');
      setVersions([]);
      setSyncing(false);
      return;
    }
    setDraft(dRes.draft);
    setLatestPublished(dRes.latestPublished);
    setPublicLiveRead(dRes.publicLiveRead);
    setPublicContentAuthority(dRes.publicContentAuthority);
    setPublicContentAuthorityDetail(dRes.publicContentAuthorityDetail);
    setError(null);
    const vRes = await fetchContentVersions(50);
    if (!vRes.success) {
      setError(formatWorkflowError(vRes));
      setVersions([]);
      setSyncing(false);
      return;
    }
    setVersions(vRes.versions);
    if (vRes.publicLiveRead) {
      setPublicLiveRead(vRes.publicLiveRead);
    }
    setSyncing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
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
        await refreshWorkflow();
      } catch {
        if (!cancelled) {
          router.push('/admin');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [router, refreshWorkflow]);

  useEffect(() => {
    if (!draft?.payload) {
      setWorkingCopy(null);
      setEditorLoadError(null);
      return;
    }
    const v = validateSiteContent(draft.payload);
    if (!v.success) {
      setWorkingCopy(null);
      setEditorLoadError(
        'Draft payload failed validation against the site schema. Re-bootstrap or fix the draft in the database.',
      );
      return;
    }
    setWorkingCopy(v.data);
    setEditorLoadError(null);
  }, [draft]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      router.push('/admin');
    } catch {
      setError('Failed to log out');
    }
  };

  const handleBootstrap = async () => {
    setMutating(true);
    setError(null);
    setSuccess(null);
    const res = await postBootstrapDraft();
    if (!res.success) {
      setError(formatWorkflowError(res));
      setMutating(false);
      return;
    }
    setSuccess('Working draft created from current canonical site content.');
    setMutating(false);
    await refreshWorkflow();
  };

  const handlePublish = async () => {
    setMutating(true);
    setError(null);
    setSuccess(null);
    const res = await postPublishDraft({
      label: publishLabel.trim() || null,
      changeSummary: publishSummary.trim() || null,
    });
    if (!res.success) {
      setError(formatWorkflowError(res));
      setMutating(false);
      return;
    }
    setPublishLabel('');
    setPublishSummary('');
    const imp = res.version.importId;
    setSuccess(
      `Published as version #${res.version.publishSequence ?? '?'}.${imp ? ` Linked import: ${imp.slice(0, 8)}…` : ''}`,
    );
    setMutating(false);
    await refreshWorkflow();
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this published version into a new working draft?')) {
      return;
    }
    setMutating(true);
    setError(null);
    setSuccess(null);
    const res = await postRestoreVersion(versionId, {
      changeSummary: restoreNote.trim() || null,
    });
    if (!res.success) {
      setError(formatWorkflowError(res));
      setMutating(false);
      return;
    }
    setSuccess('New working draft created from the selected version.');
    setRestoreNote('');
    setMutating(false);
    await refreshWorkflow();
  };

  const handleSaveDraft = async (slice: DraftEditorSlice) => {
    if (!workingCopy) {
      return;
    }
    setMutating(true);
    setError(null);
    setSuccess(null);
    const merged = mergeEditorSliceIntoSiteContent(workingCopy, slice);
    const v = validateSiteContent(merged);
    if (!v.success) {
      const first = v.error.issues[0];
      setError(first ? `${first.path.join('.')}: ${first.message}` : 'Content validation failed.');
      setMutating(false);
      return;
    }
    const res = await putSaveDraft({
      payload: merged,
      changeSummary: saveChangeSummary.trim() || null,
    });
    if (!res.success) {
      setError(formatWorkflowError(res));
      setMutating(false);
      return;
    }
    setSuccess('Draft saved.');
    setSaveChangeSummary('');
    setMutating(false);
    await refreshWorkflow();
  };

  const draftEditor =
    draft && draft.status === 'DRAFT' ? (
      <DraftEditorSection
        workingCopy={workingCopy}
        resetKey={`${draft.id}-${draft.updatedAt}`}
        loadError={editorLoadError}
        disabled={syncing || mutating}
        saving={mutating}
        saveChangeSummary={saveChangeSummary}
        onSaveChangeSummaryChange={setSaveChangeSummary}
        onDirtyChange={setEditorDirty}
        allowSave={editorDirty}
        onSave={handleSaveDraft}
      />
    ) : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <ContentWorkflowSections
      draft={draft}
      latestPublished={latestPublished}
      publicLiveRead={publicLiveRead}
      publicContentAuthority={publicContentAuthority}
      publicContentAuthorityDetail={publicContentAuthorityDetail}
      versions={versions}
      syncing={syncing}
      mutating={mutating}
      error={error}
      success={success}
      publishLabel={publishLabel}
      publishSummary={publishSummary}
      restoreNote={restoreNote}
      onPublishLabelChange={setPublishLabel}
      onPublishSummaryChange={setPublishSummary}
      onRestoreNoteChange={setRestoreNote}
      onRefresh={refreshWorkflow}
      onLogout={handleLogout}
      onBootstrap={handleBootstrap}
      onPublish={handlePublish}
      onRestore={handleRestore}
      editorPanel={draftEditor}
    />
  );
}
