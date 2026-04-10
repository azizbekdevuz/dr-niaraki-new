'use client';

import React, { createContext, useContext } from 'react';

import type { SiteContent } from '@/content/schema';

const PublicSiteContentContext = createContext<SiteContent | null>(null);

export function PublicSiteContentProvider({
  value,
  children,
}: {
  value: SiteContent;
  children: React.ReactNode;
}) {
  return <PublicSiteContentContext.Provider value={value}>{children}</PublicSiteContentContext.Provider>;
}

/**
 * Resolved site content for public routes (DB published when valid, else canonical).
 * Must be used under `PublicSiteContentProvider` (see root `app/layout.tsx`).
 */
export function usePublicSiteContent(): SiteContent {
  const ctx = useContext(PublicSiteContentContext);
  if (!ctx) {
    throw new Error(
      'usePublicSiteContent must be used within PublicSiteContentProvider (public layout missing provider?).',
    );
  }
  return ctx;
}
