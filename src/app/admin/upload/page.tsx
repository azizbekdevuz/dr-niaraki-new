'use client';

/**
 * Admin upload page - handles DOCX upload, preview, and commit
 */

import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  AlertTriangle,
  Check,
  LogOut,
  History,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import type { Details } from '@/types/details';

type TabType = 'profile' | 'about' | 'publications' | 'patents' | 'contact';

export default function AdminUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setHasValidDevice] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Parsed data
  const [parsedData, setParsedData] = useState<Details | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Commit result
  const [commitSha, setCommitSha] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  // Check auth status
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json();
        
        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }
        
        setHasValidDevice(data.hasValidDevice);
        if (!data.hasValidDevice) {
          router.push('/admin/devices');
          return;
        }
      } catch {
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleUpload = async () => {
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
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCommit = async () => {
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
        if (data.commitSha) {
          setCommitSha(data.commitSha);
          setCommitUrl(data.commitUrl);
          setSuccess('Data committed successfully! Vercel will auto-deploy.');
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Upload CV</h1>
              <p className="text-muted text-sm">Upload and parse DOCX file to update site data</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/history"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </a>
            <a
              href="/admin/devices"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Devices</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="card p-4 mb-6 border-success bg-success/5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{success}</p>
                {commitSha && (
                  <div className="mt-2 text-sm text-muted">
                    <p>Commit SHA: <code className="bg-surface-secondary px-2 py-1 rounded">{commitSha}</code></p>
                    {commitUrl && (
                      <a href={commitUrl} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
                        View on GitHub →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Section */}
        {!parsedData && (
          <div className="card p-8 text-center">
            <div className="max-w-md mx-auto">
              <FileText className="w-16 h-16 mx-auto mb-4 text-accent-primary opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Upload DOCX File</h2>
              <p className="text-muted text-sm mb-6">
                Select a .docx file containing the CV to parse and update the site data.
              </p>
              
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block btn-secondary px-6 py-3 cursor-pointer mb-4"
              >
                Choose File
              </label>
              
              {file && (
                <div className="mb-4">
                  <p className="text-foreground font-medium">{file.name}</p>
                  <p className="text-muted text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
              
              <button
                onClick={handleUpload}
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
        )}

        {/* Preview Section */}
        {parsedData && (
          <div className="space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="card p-4 border-warning bg-warning/5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Parser Warnings ({warnings.length})</p>
                    <p className="text-muted text-sm">Review these warnings before committing</p>
                  </div>
                </div>
                <ul className="list-disc list-inside text-sm text-muted space-y-1 ml-8">
                  {warnings.slice(0, 10).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {warnings.length > 10 && (
                    <li className="text-accent-primary">...and {warnings.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Preview Tabs */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-primary">
                {(['profile', 'about', 'publications', 'patents', 'contact'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-accent-primary border-b-2 border-accent-primary bg-surface-secondary'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="p-6 max-h-[500px] overflow-y-auto">
                <PreviewContent data={parsedData} tab={activeTab} />
              </div>
            </div>

            {/* Commit Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Confirm & Commit</h3>
              
              {(warnings.length > 0 || validationErrors.length > 0) && (
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgeWarnings}
                    onChange={(e) => setAcknowledgeWarnings(e.target.checked)}
                    className="w-5 h-5 rounded border-primary bg-surface-secondary text-accent-primary focus:ring-accent-primary"
                  />
                  <span className="text-sm text-muted">
                    I have reviewed and accept the {warnings.length} warning(s) and {validationErrors.length} validation issue(s)
                  </span>
                </label>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                    setWarnings([]);
                    setValidationErrors([]);
                  }}
                  className="btn-secondary px-6 py-3"
                >
                  Start Over
                </button>
                <button
                  onClick={handleCommit}
                  disabled={committing || ((warnings.length > 0 || validationErrors.length > 0) && !acknowledgeWarnings)}
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
          </div>
        )}
      </div>
    </div>
  );
}

// Preview content component
function PreviewContent({ data, tab }: { data: Details; tab: TabType }) {
  switch (tab) {
    case 'profile':
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{data.profile.name}</h3>
          <p className="text-muted">{data.profile.title}</p>
          <p className="text-secondary text-sm">{data.profile.summary?.slice(0, 500)}...</p>
        </div>
      );
      
    case 'about':
      return (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Education ({data.about.education.length})</h4>
            <ul className="space-y-2">
              {data.about.education.slice(0, 5).map((edu) => (
                <li key={edu.id} className="text-sm text-muted">
                  <span className="text-foreground">{edu.degree}</span> - {edu.institution}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Positions ({data.about.positions.length})</h4>
            <ul className="space-y-2">
              {data.about.positions.slice(0, 5).map((pos) => (
                <li key={pos.id} className="text-sm text-muted">
                  <span className="text-foreground">{pos.title}</span> @ {pos.institution}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
    case 'publications':
      return (
        <div>
          <h4 className="font-medium text-foreground mb-4">Publications ({data.publications.length})</h4>
          <ul className="space-y-3">
            {data.publications.slice(0, 10).map((pub) => (
              <li key={pub.id} className="text-sm p-3 bg-surface-secondary rounded">
                <p className="text-foreground">{pub.title}</p>
                <p className="text-muted text-xs mt-1">
                  {pub.year && <span>({pub.year})</span>} {pub.journal && <span>• {pub.journal}</span>}
                </p>
              </li>
            ))}
            {data.publications.length > 10 && (
              <li className="text-accent-primary text-sm">...and {data.publications.length - 10} more</li>
            )}
          </ul>
        </div>
      );
      
    case 'patents':
      return (
        <div>
          <h4 className="font-medium text-foreground mb-4">Patents ({data.patents.length})</h4>
          <ul className="space-y-3">
            {data.patents.slice(0, 10).map((patent) => (
              <li key={patent.id} className="text-sm p-3 bg-surface-secondary rounded">
                <p className="text-foreground">{patent.title}</p>
                <p className="text-muted text-xs mt-1">
                  {patent.number && <span>{patent.number}</span>} {patent.status && <span>• {patent.status}</span>}
                </p>
              </li>
            ))}
            {data.patents.length > 10 && (
              <li className="text-accent-primary text-sm">...and {data.patents.length - 10} more</li>
            )}
          </ul>
        </div>
      );
      
    case 'contact':
      return (
        <div className="space-y-3">
          {data.contact.email && (
            <p className="text-sm"><span className="text-muted">Email:</span> <span className="text-foreground">{data.contact.email}</span></p>
          )}
          {data.contact.phone && (
            <p className="text-sm"><span className="text-muted">Phone:</span> <span className="text-foreground">{data.contact.phone}</span></p>
          )}
          {data.contact.website && (
            <p className="text-sm"><span className="text-muted">Website:</span> <span className="text-foreground">{data.contact.website}</span></p>
          )}
          {data.contact.address && (
            <p className="text-sm"><span className="text-muted">Address:</span> <span className="text-foreground">{data.contact.address}</span></p>
          )}
          {data.contact.social.linkedin && (
            <p className="text-sm"><span className="text-muted">LinkedIn:</span> <span className="text-foreground">{data.contact.social.linkedin}</span></p>
          )}
        </div>
      );
      
    default:
      return null;
  }
}
