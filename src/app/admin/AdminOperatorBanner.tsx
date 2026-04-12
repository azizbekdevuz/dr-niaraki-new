'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Lightweight operator notices from `/api/admin/status` (only when hints exist).
 */
export function AdminOperatorBanner() {
  const [hints, setHints] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/admin/status', { credentials: 'include' });
        const data: unknown = await res.json();
        if (cancelled || typeof data !== 'object' || data === null) {
          return;
        }
        const rec = data as { operatorHints?: unknown };
        if (Array.isArray(rec.operatorHints) && rec.operatorHints.every((h) => typeof h === 'string')) {
          setHints(rec.operatorHints);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hints.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
      role="status"
    >
      <div className="flex gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <ul className="list-disc space-y-1 pl-1">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
