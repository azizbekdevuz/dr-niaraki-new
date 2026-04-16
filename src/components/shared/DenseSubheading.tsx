'use client';

import clsx from 'clsx';
import React from 'react';

export type DenseSubheadingProps = {
  children: React.ReactNode;
  className?: string;
};

/** h3-style band title for multi-column about/research-style layouts. */
export function DenseSubheading({ children, className }: DenseSubheadingProps) {
  return (
    <h3
      className={clsx(
        'mb-6 border-b border-primary/20 pb-2 text-xl font-bold tracking-tight text-foreground md:mb-8 md:text-2xl lg:text-3xl',
        className,
      )}
    >
      {children}
    </h3>
  );
}
