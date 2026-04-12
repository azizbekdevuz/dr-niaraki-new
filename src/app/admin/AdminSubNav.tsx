'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/content', label: 'Site content' },
  { href: '/admin/imports', label: 'CV imports' },
  { href: '/admin/upload', label: 'Upload & legacy commit' },
  { href: '/admin/history', label: 'Upload history' },
  { href: '/admin/devices', label: 'Devices' },
] as const;

/**
 * Calm secondary navigation for post-login admin workflow (hidden on the sign-in screen).
 */
export function AdminSubNav() {
  const pathname = usePathname();
  if (pathname === '/admin') {
    return null;
  }

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b border-primary/30 pb-4 text-sm"
      aria-label="Admin sections"
    >
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active
                ? 'bg-accent-primary/15 text-foreground font-medium'
                : 'text-muted hover:bg-surface-secondary hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
