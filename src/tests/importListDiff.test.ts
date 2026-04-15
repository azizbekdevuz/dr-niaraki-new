import { describe, expect, it } from 'vitest';

import { diffIdLists, shallowFieldChanges } from '@/server/imports/importListDiff';

describe('diffIdLists', () => {
  it('classifies added and removed rows by id', () => {
    const before = [
      { id: 'a', name: 'A', n: 1 },
      { id: 'b', name: 'B', n: 2 },
    ];
    const after = [
      { id: 'a', name: 'A', n: 1 },
      { id: 'c', name: 'C', n: 3 },
    ];
    const d = diffIdLists(before, after, (r) => r.name, ['name', 'n']);
    expect(d.added).toEqual([{ id: 'c', label: 'C' }]);
    expect(d.removed).toEqual([{ id: 'b', label: 'B' }]);
    expect(d.changed).toHaveLength(0);
    expect(d.unchangedCount).toBe(1);
  });

  it('detects field changes on shared ids', () => {
    const before = [{ id: 'x', title: 'Old', year: 2020 }];
    const after = [{ id: 'x', title: 'New', year: 2020 }];
    const d = diffIdLists(before, after, (r) => r.title, ['title', 'year']);
    expect(d.added).toHaveLength(0);
    expect(d.removed).toHaveLength(0);
    expect(d.unchangedCount).toBe(0);
    expect(d.changed).toHaveLength(1);
    expect(d.changed[0]?.id).toBe('x');
    expect(d.changed[0]?.changes.map((c) => c.field)).toContain('title');
  });
});

describe('shallowFieldChanges', () => {
  it('stringifies nested values for comparison', () => {
    const ch = shallowFieldChanges({ k: [1, 2] }, { k: [1, 2, 3] }, ['k']);
    expect(ch).toHaveLength(1);
    expect(ch[0]?.field).toBe('k');
  });
});
