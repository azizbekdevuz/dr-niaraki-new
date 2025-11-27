/**
 * Admin layout - wraps all admin pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Dr. Sadeghi-Niaraki',
  description: 'Admin dashboard for managing CV and profile data',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
