import { describe, expect, it } from 'vitest';

import {
  clampPage,
  effectivePaginationPageSize,
  slicePage,
  totalPages,
  visiblePageNumbers,
} from '@/lib/listPaginationMath';

describe('listPaginationMath', () => {
  it('effectivePaginationPageSize widens page for short lists', () => {
    expect(effectivePaginationPageSize(0, 3)).toBe(3);
    expect(effectivePaginationPageSize(3, 3)).toBe(3);
    expect(effectivePaginationPageSize(4, 3)).toBe(4);
    expect(effectivePaginationPageSize(5, 3)).toBe(3);
    expect(effectivePaginationPageSize(10, 3)).toBe(3);
  });

  it('totalPages', () => {
    expect(totalPages(0, 5)).toBe(1);
    expect(totalPages(5, 5)).toBe(1);
    expect(totalPages(6, 5)).toBe(2);
    expect(totalPages(11, 5)).toBe(3);
  });

  it('clampPage', () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(99, 3)).toBe(3);
  });

  it('slicePage', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(slicePage(items, 1, 2)).toEqual(['a', 'b']);
    expect(slicePage(items, 2, 2)).toEqual(['c', 'd']);
    expect(slicePage(items, 3, 2)).toEqual(['e']);
  });

  it('slicePage clamps page beyond total pages (integration-style guard)', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    expect(slicePage(items, 99, 4)).toEqual(['e', 'f', 'g', 'h']);
    expect(slicePage(items, 2, 4)).toEqual(['e', 'f', 'g', 'h']);
  });

  it('visiblePageNumbers', () => {
    expect(visiblePageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(visiblePageNumbers(5, 10)).toEqual([3, 4, 5, 6, 7]);
  });
});
