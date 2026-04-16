'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { clampPage, totalPages, visiblePageNumbers } from '@/lib/listPaginationMath';

export type ListPaginationProps = {
  /** 1-based current page */
  page: number;
  itemCount: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  /** Accessible name for the nav landmark, e.g. "Publications list" */
  ariaLabel: string;
  className?: string;
};

const controlButtonBase = clsx(
  'inline-flex shrink-0 touch-manipulation items-center justify-center rounded-xl border border-primary/50 bg-surface-secondary/80 text-foreground/90',
  'min-h-12 min-w-12 motion-safe:transition-[color,background-color,border-color,transform] motion-safe:duration-150',
  'hover:border-accent-primary hover:bg-accent-primary/10 hover:text-accent-primary',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
  'disabled:pointer-events-none disabled:opacity-35',
  '[-webkit-tap-highlight-color:transparent]',
  'md:h-11 md:min-h-0 md:min-w-[2.75rem] md:w-auto md:active:scale-100',
);

const pageNumberButtonBase = clsx(
  'inline-flex shrink-0 touch-manipulation items-center justify-center rounded-xl px-2.5 text-sm font-semibold tabular-nums',
  'min-h-12 min-w-12 motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
  '[-webkit-tap-highlight-color:transparent]',
  'md:min-h-11 md:min-w-[2.75rem] md:px-3 md:active:scale-100',
);

export function ListPagination({
  page,
  itemCount,
  pageSize,
  onPageChange,
  ariaLabel,
  className,
}: ListPaginationProps) {
  const pages = totalPages(itemCount, pageSize);
  const safePage = clampPage(page, pages);
  const numbers = visiblePageNumbers(safePage, pages);

  if (pages <= 1 || itemCount === 0) {
    return null;
  }

  const go = (p: number) => onPageChange(clampPage(p, pages));

  return (
    <nav
      className={clsx(
        'mt-8 flex w-full min-w-0 max-w-full flex-col items-stretch gap-4 rounded-2xl border border-primary/35 bg-surface-primary/60 shadow-pagination-panel backdrop-blur-sm',
        'px-2 pt-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-3',
        'md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-3 md:px-6 md:py-4 md:pb-4',
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:w-auto md:max-w-none md:gap-2">
        <button
          type="button"
          className={controlButtonBase}
          onClick={() => go(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
        </button>

        <div
          className={clsx(
            'min-h-12 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]',
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            'md:h-auto md:min-h-0 md:w-auto md:flex-none md:overflow-visible',
          )}
        >
          <div className="mx-auto flex w-max max-w-full flex-nowrap gap-1.5 px-0.5 md:mx-0 md:flex-wrap md:justify-center md:gap-1.5 md:px-1">
            {numbers.map((n) => (
              <button
                key={n}
                type="button"
                className={clsx(
                  pageNumberButtonBase,
                  n === safePage
                    ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-md ring-1 ring-white/10'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground',
                )}
                onClick={() => go(n)}
                aria-label={`Page ${n}`}
                aria-current={n === safePage ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={controlButtonBase}
          onClick={() => go(safePage + 1)}
          disabled={safePage >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      </div>

      <p
        className="text-center text-xs font-medium tabular-nums text-muted md:ml-auto md:text-right"
        aria-live="polite"
        aria-atomic="true"
      >
        Page <span className="text-foreground/90">{safePage}</span> of {pages}
        <span className="mx-2 text-primary/40" aria-hidden>
          ·
        </span>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>
    </nav>
  );
}
