/**
 * Small id-keyed list diff helpers for import review (no generic recursive diff).
 */

export type ListDiffEntry = { id: string; label: string };

export type ListItemFieldChange = { field: string; before: string; after: string };

export type ListItemChange = { id: string; label: string; changes: ListItemFieldChange[] };

export type StructuredListDiff = {
  added: ListDiffEntry[];
  removed: ListDiffEntry[];
  changed: ListItemChange[];
  unchangedCount: number;
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

/**
 * Compare two same-shaped records by a fixed key list; values are JSON-stringified for stability.
 */
export function shallowFieldChanges(
  before: unknown,
  after: unknown,
  keys: readonly string[],
): ListItemFieldChange[] {
  const b = asRecord(before);
  const a = asRecord(after);
  const out: ListItemFieldChange[] = [];
  for (const k of keys) {
    const bv = JSON.stringify(b[k]);
    const av = JSON.stringify(a[k]);
    if (bv !== av) {
      out.push({
        field: k,
        before: bv === undefined ? '' : String(b[k]),
        after: av === undefined ? '' : String(a[k]),
      });
    }
  }
  return out;
}

export function diffIdLists<T extends { id: string }>(
  before: readonly T[],
  after: readonly T[],
  labelOf: (row: T) => string,
  compareKeys: readonly (keyof T & string)[],
): StructuredListDiff {
  const beforeMap = new Map(before.map((r) => [r.id, r]));
  const afterMap = new Map(after.map((r) => [r.id, r]));
  const added: ListDiffEntry[] = [];
  const removed: ListDiffEntry[] = [];
  const changed: ListItemChange[] = [];
  let unchangedCount = 0;

  for (const [id, row] of afterMap) {
    if (!beforeMap.has(id)) {
      added.push({ id, label: labelOf(row) });
    }
  }
  for (const [id, row] of beforeMap) {
    if (!afterMap.has(id)) {
      removed.push({ id, label: labelOf(row) });
    }
  }
  for (const [id, aRow] of afterMap) {
    const bRow = beforeMap.get(id);
    if (!bRow) {
      continue;
    }
    const changes = shallowFieldChanges(bRow, aRow, compareKeys);
    if (changes.length === 0) {
      unchangedCount += 1;
    } else {
      changed.push({ id, label: labelOf(aRow), changes });
    }
  }

  return { added, removed, changed, unchangedCount };
}
