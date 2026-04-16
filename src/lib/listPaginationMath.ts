/**
 * Pure helpers for client-side list pagination (no I/O).
 */

/** Below this length, show every item on one page (no pager). */
export const MIN_ITEM_COUNT_BEFORE_PAGINATION = 5;

/**
 * When `itemCount` is under `MIN_ITEM_COUNT_BEFORE_PAGINATION`, expand the effective
 * page size so the whole list fits on one page (avoids a pager for 3–4 items).
 */
export function effectivePaginationPageSize(itemCount: number, requestedPageSize: number): number {
  const safeRequested = Math.max(1, requestedPageSize);
  if (itemCount <= 0) {
    return safeRequested;
  }
  if (itemCount < MIN_ITEM_COUNT_BEFORE_PAGINATION) {
    return itemCount;
  }
  return safeRequested;
}

export function totalPages(itemCount: number, pageSize: number): number {
  if (itemCount <= 0 || pageSize <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function clampPage(page: number, pages: number): number {
  if (pages < 1) {
    return 1;
  }
  return Math.min(Math.max(1, page), pages);
}

export function slicePage<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const pages = totalPages(items.length, pageSize);
  const safePage = clampPage(page, pages);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Inclusive page indices for compact numeric controls (1-based). */
export function visiblePageNumbers(currentPage: number, pages: number, windowSize = 5): number[] {
  if (pages <= windowSize) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + windowSize - 1;
  if (end > pages) {
    end = pages;
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
