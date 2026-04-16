'use client';

/**
 * Admin upload page — DOCX upload, preview, and legacy JSON/GitHub commit.
 * Composition only; state lives in hooks, UI in components under ./components.
 */

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { CvCommitCard } from './components/CvCommitCard';
import { CvParseWarningsCard } from './components/CvParseWarningsCard';
import { CvPreviewTabsCard } from './components/CvPreviewTabsCard';
import { CvUploadErrorBanner } from './components/CvUploadErrorBanner';
import { CvUploadFormCard } from './components/CvUploadFormCard';
import { CvUploadSuccessBanner } from './components/CvUploadSuccessBanner';
import { LegacyEditorialModelNotice } from './components/LegacyEditorialModelNotice';
import { UploadPageToolbar } from './components/UploadPageToolbar';
import { useAdminUploadAuthGate } from './hooks/useAdminUploadAuthGate';
import { useCvDocxWorkflow } from './hooks/useCvDocxWorkflow';

export default function AdminUploadPage() {
  const router = useRouter();
  const { loading } = useAdminUploadAuthGate(router);
  const workflow = useCvDocxWorkflow(router);

  const canCommit =
    !((workflow.warnings.length > 0 || workflow.validationErrors.length > 0) && !workflow.acknowledgeWarnings);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto">
        <UploadPageToolbar onLogout={workflow.handleLogout} />

        <LegacyEditorialModelNotice uploadMetaNote={workflow.uploadMetaNote} />

        {workflow.success ? (
          <CvUploadSuccessBanner
            message={workflow.success}
            commitDomainNote={workflow.commitDomainNote}
            commitSha={workflow.commitSha}
            commitUrl={workflow.commitUrl}
          />
        ) : null}

        {workflow.error ? <CvUploadErrorBanner message={workflow.error} /> : null}

        {!workflow.parsedData ? (
          <CvUploadFormCard
            file={workflow.file}
            uploading={workflow.uploading}
            onFileChange={workflow.handleFileChange}
            onUpload={workflow.handleUpload}
          />
        ) : (
          <div className="space-y-6">
            <CvParseWarningsCard warnings={workflow.warnings} />
            <CvPreviewTabsCard
              data={workflow.parsedData}
              activeTab={workflow.activeTab}
              onTabChange={workflow.setActiveTab}
            />
            <CvCommitCard
              warningsCount={workflow.warnings.length}
              validationErrorsCount={workflow.validationErrors.length}
              acknowledgeWarnings={workflow.acknowledgeWarnings}
              onAcknowledgeChange={workflow.setAcknowledgeWarnings}
              committing={workflow.committing}
              canCommit={canCommit}
              onStartOver={workflow.startOver}
              onCommit={workflow.handleCommit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
