'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

export type SiteWordmarkProps = {
  readonly className?: string;
  /** Header uses a slightly larger scale; footer stays assertive but calmer. */
  readonly variant?: 'header' | 'footer';
};

/**
 * Distinctive wordmark for “Dr. Sadeghi-Niaraki” — academic, high-tech, not playful.
 */
export function SiteWordmark({ className, variant = 'header' }: SiteWordmarkProps) {
  const isHeader = variant === 'header';

  return (
    <Link
      href="/"
      className={clsx(
        'group/wordmark inline-flex max-w-full flex-col items-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isHeader && 'motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-px',
        className,
      )}
      aria-label="Dr. Sadeghi-Niaraki — home"
    >
      <span
        className={clsx(
          'font-semibold uppercase tracking-[0.22em] text-accent-primary/95',
          isHeader ? 'text-[0.62rem] sm:text-[0.68rem]' : 'text-[0.62rem]',
        )}
      >
        Dr.
      </span>
      <span
        className={clsx(
          'min-w-0 whitespace-nowrap bg-gradient-to-r from-foreground via-foreground to-accent-primary bg-clip-text font-bold leading-tight tracking-tight text-transparent',
          isHeader ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl md:text-2xl',
        )}
      >
        Sadeghi-Niaraki
      </span>
    </Link>
  );
}
