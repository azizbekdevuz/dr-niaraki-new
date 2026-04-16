'use client';

import clsx from 'clsx';
import {
  FileText,
  FlaskConical,
  Home,
  Mail,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useId, useState } from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';

import { NAV_ITEMS } from './constants';
import { SiteWordmark } from './SiteWordmark';

const HEADER_NAV_ICONS = {
  home: Home,
  about: User,
  research: FlaskConical,
  publications: FileText,
  patents: Trophy,
  contact: Mail,
} as const;

type HeaderNavIconKey = keyof typeof HEADER_NAV_ICONS;

function HeaderNavIcon({
  iconKey,
  className,
}: {
  iconKey: (typeof NAV_ITEMS)[number]['iconKey'];
  className?: string;
}) {
  const Icon = HEADER_NAV_ICONS[iconKey as HeaderNavIconKey];
  return <Icon className={className} aria-hidden />;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const mobileNavId = useId();
  const siteContent = usePublicSiteContent();
  const { aboutHeading, copyrightName } = siteContent.layout.footer;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={clsx(
          'fixed left-0 right-0 top-0 z-fixed gpu-accelerated motion-safe:transition-all motion-safe:duration-300',
          isScrolled ? 'glass shadow-lg' : 'bg-transparent',
        )}
      >
        <div className="container-custom">
          <nav
            className="flex items-center justify-between gap-3 py-2.5 md:py-4"
            aria-label="Primary"
          >
            <SiteWordmark variant="header" className="min-w-0 shrink" />

            {!isMobile && (
              <div className="rounded-full border border-primary/20 bg-surface-primary/45 px-1 py-1 shadow-sm backdrop-blur-md">
                <ul className="flex items-center gap-0.5 lg:gap-1">
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                            active
                              ? 'bg-accent-primary/15 text-accent-primary'
                              : 'text-foreground/75 hover:bg-surface-hover hover:text-foreground',
                          )}
                        >
                          <HeaderNavIcon
                            iconKey={item.iconKey}
                            className="h-4 w-4 opacity-85"
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {isMobile && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                className={clsx(
                  'relative inline-flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-surface-primary/50 touch-manipulation',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  '[-webkit-tap-highlight-color:transparent]',
                )}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls={mobileNavId}
              >
                <div className="flex w-6 flex-col gap-1.5" aria-hidden>
                  <span
                    className={clsx(
                      'block h-0.5 origin-center bg-foreground motion-safe:transition-transform motion-safe:duration-200',
                      isMobileMenuOpen && 'translate-y-2 rotate-45',
                    )}
                  />
                  <span
                    className={clsx(
                      'block h-0.5 bg-foreground motion-safe:transition-opacity motion-safe:duration-200',
                      isMobileMenuOpen && 'opacity-0',
                    )}
                  />
                  <span
                    className={clsx(
                      'block h-0.5 origin-center bg-foreground motion-safe:transition-transform motion-safe:duration-200',
                      isMobileMenuOpen && '-translate-y-2 -rotate-45',
                    )}
                  />
                </div>
              </button>
            )}
          </nav>
        </div>
      </header>

      {isMobile && (
        <div
          className={clsx(
            'fixed inset-0 z-modal motion-safe:transition-opacity motion-safe:duration-200',
            isMobileMenuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div
            className="absolute inset-0 bg-overlay-medium backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id={mobileNavId}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className={clsx(
              'absolute right-0 top-0 flex h-full w-[min(20rem,calc(100vw-0.75rem))] max-w-full flex-col border-l border-primary/25 bg-surface-primary/95 shadow-2xl backdrop-blur-xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out',
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <div className="border-b border-primary/20 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top,0px))]">
              <SiteWordmark variant="header" />
              <p className="mt-3 text-xs leading-relaxed text-muted">{aboutHeading}</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile pages">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium touch-manipulation',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary/45',
                          active
                            ? 'bg-gradient-to-r from-accent-primary/18 to-accent-secondary/15 text-accent-primary'
                            : 'text-foreground/80 hover:bg-surface-hover hover:text-foreground',
                        )}
                      >
                        <HeaderNavIcon
                          iconKey={item.iconKey}
                          className="h-5 w-5 shrink-0 opacity-90"
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-primary/20 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <p className="text-center text-[0.7rem] text-muted">
                © {new Date().getFullYear()} {copyrightName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
