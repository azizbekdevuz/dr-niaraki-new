import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { DeviceProvider } from '@/components/shared/DeviceProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { PublicSiteContentProvider } from '@/contexts/PublicSiteContentContext';
import { getDeviceInfo } from '@/lib/device-info.server';
import { getPublicSiteContent } from '@/server/content/publicSiteContent';

import AppLayoutContent from './AppLayoutContent';
import { buildSiteMetadata } from './metadata';

import './globals.css';
import "../styles/atomcursor.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getPublicSiteContent();
  return buildSiteMetadata(data);
}

// Next.js 15 requires viewport to be in separate export
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#63b3ed' },
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  colorScheme: 'dark light',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const deviceInfo = await getDeviceInfo();
  const { data: siteContent } = await getPublicSiteContent();

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <PublicSiteContentProvider value={siteContent}>
          <LoadingProvider>
            <DeviceProvider initialDeviceInfo={deviceInfo}>
              <AppStateProvider>
                <ErrorBoundary>
                  <AppLayoutContent>{children}</AppLayoutContent>
                </ErrorBoundary>
              </AppStateProvider>
            </DeviceProvider>
          </LoadingProvider>
        </PublicSiteContentProvider>
        <Analytics />
      </body>
    </html>
  );
}
