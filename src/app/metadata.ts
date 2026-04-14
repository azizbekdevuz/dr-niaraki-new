import type { Metadata } from 'next';

import type { SiteContent } from '@/content/schema';

/**
 * Build Next.js metadata from a resolved `SiteContent` snapshot (canonical or DB-published).
 */
export function buildSiteMetadata(siteContent: SiteContent): Metadata {
  return {
    metadataBase: new URL(siteContent.meta.metadataBase),
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    keywords: siteContent.meta.keywords,
    authors: [{ name: siteContent.meta.authorName }],
    creator: siteContent.meta.creator,
    publisher: siteContent.meta.publisher,

    manifest: '/manifest.json',

    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      other: [{ url: '/mstile-150x150.png', sizes: '150x150', type: 'image/png' }],
    },

    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteContent.meta.appleWebAppTitle,
      startupImage: [
        {
          url: '/apple-splash-1125-2436.png',
          media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
        },
      ],
    },

    openGraph: {
      title: siteContent.meta.openGraphTitle,
      description: siteContent.meta.openGraphDescription,
      type: 'website',
      locale: 'en_US',
      url: siteContent.meta.openGraphUrl,
      siteName: siteContent.meta.openGraphSiteName,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Dr. Abolghasem Sadeghi-Niaraki - Associate Professor',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: siteContent.meta.twitterTitle,
      description: siteContent.meta.twitterDescription,
      images: ['/twitter-image.png'],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      other: {
        'msvalidate.01': 'your-bing-verification-code',
      },
    },

    category: 'education',
    classification: 'academic research',

    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'msapplication-TileColor': '#63b3ed',
      'msapplication-TileImage': '/mstile-150x150.png',
      'msapplication-config': '/browserconfig.xml',
    },
  };
}
