/**
 * Admin layout - wraps all admin pages
 * Uses the main website layout (Header/Footer from AppLayoutContent)
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
  // No wrapper needed - uses root layout from AppLayoutContent
  // Just add padding to account for fixed header
  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      <div className="container-custom py-8 md:py-12">
        {children}
      </div>
    </div>
  );
}
