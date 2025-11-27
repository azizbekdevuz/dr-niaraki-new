import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of static file extensions to skip
const STATIC_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.ico', '.svg',
  '.js', '.css', '.json', '.woff', '.woff2', '.ttf', '.otf'
];

export function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))
  ) {
    return NextResponse.next();
  }

  // Get user agent for device detection
  const userAgent = request.headers.get('user-agent') || '';
  
  // Enhanced device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android.*tablet|tablet.*Android|Android.*Pad|Pad.*Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  
  // Detect browser
  const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  
  // Create response with device info headers
  const response = NextResponse.next();
  
  // Set device type headers
  response.headers.set('x-device-type', isMobile ? 'mobile' : 'desktop');
  response.headers.set('x-is-tablet', isTablet ? 'true' : 'false');
  response.headers.set('x-is-ios', isIOS ? 'true' : 'false');
  response.headers.set('x-is-android', isAndroid ? 'true' : 'false');
  
  // Set browser headers
  response.headers.set('x-browser-chrome', isChrome ? 'true' : 'false');
  response.headers.set('x-browser-safari', isSafari ? 'true' : 'false');
  response.headers.set('x-browser-firefox', isFirefox ? 'true' : 'false');
  
  // Add comprehensive security headers
  
  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "upgrade-insecure-requests"
  ];
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  // Add performance headers
  response.headers.set('x-middleware-cache', 'HIT');
  
  // Add cache headers for HTML pages
  if (!pathname.includes('.')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );
  }
  
  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};