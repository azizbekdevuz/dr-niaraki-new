'use client';

import { useEffect, useState } from 'react';

type RouterLike = { push: (href: string) => void };

/**
 * Ensures admin session + registered device before showing the upload UI.
 */
export function useAdminUploadAuthGate(router: RouterLike) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/status', {
          credentials: 'include',
        });
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }

        if (!data.hasValidDevice) {
          router.push('/admin/devices');
          return;
        }
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

    void checkStatus();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { loading };
}
