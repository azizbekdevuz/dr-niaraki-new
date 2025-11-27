import type { Metadata } from 'next';

export const generateMetadata = (): Metadata => ({
  metadataBase: new URL('https://abolghasemsadeghi-n.com'),
  title: 'Dr. Abolghasem Sadeghi-Niaraki | Associate Professor',
  description: 'Official website of Dr. Abolghasem Sadeghi-Niaraki - Leading researcher in Extended Reality, AI, and GIS at Sejong University',
  keywords: 'XR, Metaverse, AI, GIS, Research, Sejong University, Computer Science, Extended Reality',
  authors: [{ name: 'Dr. Abolghasem Sadeghi-Niaraki' }],
  creator: 'Dr. Abolghasem Sadeghi-Niaraki',
  publisher: 'Sejong University',
  
  // PWA and App configuration
  manifest: '/manifest.json',
  
  // Icons configuration for App Router (optimized)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/mstile-150x150.png', sizes: '150x150', type: 'image/png' }
    ]
  },
  
  // Apple Web App configuration (optimized)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dr. Niaraki',
    startupImage: [
      { url: '/apple-splash-1125-2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' }
    ]
  },
  
  // Open Graph metadata
  openGraph: {
    title: 'Dr. Abolghasem Sadeghi-Niaraki',
    description: 'Associate Professor at Sejong University - Leading researcher in Extended Reality, AI, and GIS',
    type: 'website',
    locale: 'en_US',
    url: 'https://abolghasemsadeghi-n.com',
    siteName: 'Dr. Sadeghi-Niaraki Official Website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dr. Abolghasem Sadeghi-Niaraki - Associate Professor'
      }
    ]
  },
  
  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Abolghasem Sadeghi-Niaraki',
    description: 'Associate Professor at Sejong University - Leading researcher in Extended Reality, AI, and GIS',
    images: ['/twitter-image.png']
  },
  
  // Additional metadata
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
  
  // Verification (update these with your actual verification codes)
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code'
    }
  },
  
  // App-specific metadata
  category: 'education',
  classification: 'academic research',
  
  // Additional meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#63b3ed',
    'msapplication-TileImage': '/mstile-150x150.png',
    'msapplication-config': '/browserconfig.xml'
  }
}); 