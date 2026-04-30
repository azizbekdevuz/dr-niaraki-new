'use client';

import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { SimpleListItem } from '@/content/schema';
import type { DraftEditorSlice } from '@/lib/draftEditorSlice';

import { careerFieldClass, defaultSimpleListItem, newStableId } from './draftEditorCareerShared';

type Props = {
  slice: DraftEditorSlice;
  disabled: boolean;
  onSliceChange: (next: DraftEditorSlice) => void;
};

function updateList(
  slice: DraftEditorSlice,
  key: 'teaching' | 'supervision' | 'service',
  nextList: SimpleListItem[],
): DraftEditorSlice {
  return { ...slice, [key]: nextList };
}

function ListBlock({
  title,
  description,
  testId,
  items,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  testId: string;
  items: SimpleListItem[];
  disabled: boolean;
  onChange: (next: SimpleListItem[]) => void;
}) {
  const off = disabled;
  return (
    <div data-testid={testId}>
      <h4 className="text-xs font-semibold text-secondary mb-1">{title}</h4>
      <p className="text-xs text-muted mb-3">{description}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border border-primary/30 p-3 bg-surface-secondary/30 space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-[11px] text-muted">Row {i + 1}</span>
              <button
                type="button"
                aria-label={`Remove ${title} row`}
                disabled={off}
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-1.5 rounded border border-error/40 text-error hover:bg-error/10 disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="text-xs text-muted block mb-1">Id (stable key)</span>
              <input
                value={item.id}
                onChange={(e) =>
                  onChange(items.map((row, idx) => (idx === i ? { ...row, id: e.target.value } : row)))
                }
                disabled={off}
                className={careerFieldClass}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted block mb-1">Title / heading</span>
              <input
                value={item.title}
                onChange={(e) =>
                  onChange(items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row)))
                }
                disabled={off}
                className={careerFieldClass}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted block mb-1">Body (optional)</span>
              <textarea
                value={item.body ?? ''}
                onChange={(e) =>
                  onChange(
                    items.map((row, idx) =>
                      idx === i ? { ...row, body: e.target.value.trim() ? e.target.value : undefined } : row,
                    ),
                  )
                }
                disabled={off}
                rows={4}
                className={careerFieldClass}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          disabled={off}
          onClick={() => onChange([...items, { ...defaultSimpleListItem(), id: newStableId() }])}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-secondary disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add row
        </button>
      </div>
    </div>
  );
}

export function DraftEditorSimpleListsForm({ slice, disabled, onSliceChange }: Props) {
  return (
    <div className="space-y-8 border-t border-primary/20 pt-8 mt-8" data-testid="draft-editor-simple-lists">
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-1">Teaching, supervision, and service</h3>
        <p className="text-xs text-muted mb-4">
          Simple titled blocks used on public-facing list sections. Rows imported from CV narrative use ids
          starting with <code className="text-foreground">cv-nar-</code> until you rename them.
        </p>
        <div className="grid gap-8 lg:grid-cols-1">
          <ListBlock
            title="Teaching"
            testId="draft-editor-teaching-list"
            description="Course and teaching narrative captured from CV merges here when the parser classifies the section as teaching."
            items={slice.teaching}
            disabled={disabled}
            onChange={(teaching) => onSliceChange(updateList(slice, 'teaching', teaching))}
          />
          <ListBlock
            title="Supervision & leadership"
            testId="draft-editor-supervision-list"
            description="Academic leadership / supervision narrative from the CV (not employment rows)."
            items={slice.supervision}
            disabled={disabled}
            onChange={(supervision) => onSliceChange(updateList(slice, 'supervision', supervision))}
          />
          <ListBlock
            title="Professional service"
            testId="draft-editor-service-list"
            description="Professional services, editorial/review work, workshops/exhibitions, and skills sections from the CV map here."
            items={slice.service}
            disabled={disabled}
            onChange={(service) => onSliceChange(updateList(slice, 'service', service))}
          />
        </div>
      </div>
    </div>
  );
}
