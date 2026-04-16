import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clampPage,
  effectivePaginationPageSize,
  slicePage,
  totalPages,
} from '@/lib/listPaginationMath';

/**
 * Client-only pagination over a list: resets page when `resetToken` changes,
 * clamps when the list shrinks, and slices with the same rules as `slicePage`.
 * Short lists (under `MIN_ITEM_COUNT_BEFORE_PAGINATION` in `listPaginationMath`) use one page
 * so the pager stays hidden and every item remains visible.
 */
export function usePaginatedSlice<T>(
  items: readonly T[],
  requestedPageSize: number,
  resetToken: unknown,
): {
  slice: readonly T[];
  page: number;
  setPage: (n: number) => void;
  pages: number;
  itemCount: number;
  /** Effective page size for slicing and pagination UI (may equal item count when the list is short). */
  pageSize: number;
} {
  const itemCount = items.length;
  const pageSize = effectivePaginationPageSize(itemCount, requestedPageSize);
  const pages = totalPages(itemCount, pageSize);
  const [page, setPageState] = useState(1);

  useEffect(() => {
    setPageState(1);
  }, [resetToken]);

  useEffect(() => {
    setPageState((prev) => clampPage(prev, pages));
  }, [pages]);

  const setPage = useCallback(
    (n: number) => {
      setPageState(clampPage(n, pages));
    },
    [pages],
  );

  const slice = useMemo(
    () => slicePage(items, page, pageSize),
    [items, page, pageSize],
  );

  return { slice, page, setPage, pages, itemCount, pageSize };
}
