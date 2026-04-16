'use client';

/**
 * List persisted CV imports (Prisma). Requires logged-in admin + registered device (same bar as content workflow APIs).
 */

import { Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

type ImportRow = {
  id: string;
  status: string;
  originalFileName: string;
  parserVersion: string | null;
  createdAt: string;
};

export default function AdminImportsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
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
        const res = await fetch('/api/admin/imports', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.message || data.error || 'Failed to load imports');
          return;
        }
        if (!cancelled) {
          setImports(data.imports as ImportRow[]);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load imports');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${TW_ACCENT_SOFT_GRADIENT}`}>
            <Package className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">CV imports</h1>
            <p className="text-muted text-sm">
              Prisma-backed pipeline: each row is an uploaded DOCX → parse → review → merge into your working draft
              (then publish from Site content).
            </p>
          </div>
        </div>

        {error && (
          <div className="card p-4 mb-6 border-error/40 bg-error/5 text-error text-sm">
            {error}
          </div>
        )}

        {imports.length === 0 ? (
          <div className="card p-6 text-sm text-muted space-y-2">
            <p>No imports yet.</p>
            <p>
              Use <span className="text-foreground font-medium">Upload & legacy commit</span> in the bar above, send a
              DOCX, and the app will create an import row automatically when the database is available.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {imports.map((imp) => (
              <li key={imp.id}>
                <Link
                  href={`/admin/imports/${imp.id}`}
                  className="card block p-4 hover:border-accent-primary/40 transition-colors"
                >
                  <div className="flex justify-between gap-4">
                    <span className="font-medium text-foreground">{imp.originalFileName}</span>
                    <span className="text-xs uppercase text-muted">{imp.status}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {new Date(imp.createdAt).toLocaleString()} · {imp.parserVersion ?? 'parser ?'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
