import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { DeviceProvider } from '@/components/shared/DeviceProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { getDeviceInfo } from '@/lib/device-info.server';

import AppLayoutContent from './AppLayoutContent';
import { generateMetadata } from './metadata';

import './globals.css';
import "../styles/atomcursor.css";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

// Use centralized metadata configuration
export const metadata: Metadata = generateMetadata();

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
  // Get initial device info server-side
  const deviceInfo = await getDeviceInfo();
  
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <LoadingProvider>
          <DeviceProvider initialDeviceInfo={deviceInfo}>
            <AppStateProvider>
              <ErrorBoundary>
                {/* App content with intelligent loading */}
                <AppLayoutContent>
                  {children}
                </AppLayoutContent>
              </ErrorBoundary>
            </AppStateProvider>
          </DeviceProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
