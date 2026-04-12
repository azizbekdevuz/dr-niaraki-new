'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { AboutAwardItem } from '@/content/schema';
import { moveIndexInArray } from '@/lib/draftEditorSlice';

import { careerFieldClass, confirmRemoveLastListItem, defaultAward } from './draftEditorCareerShared';

type Props = {
  items: AboutAwardItem[];
  disabled: boolean;
  onChange: (next: AboutAwardItem[]) => void;
};

export function DraftEditorAwardsList({ items, disabled, onChange }: Props) {
  const off = disabled;

  return (
    <div>
      <h3 className="text-sm font-semibold text-secondary mb-1">Awards & recognition</h3>
      <p className="text-xs text-muted mb-4">
        Cards on the About page. Impact is stored for future use; details are shown publicly.
      </p>
      <div className="space-y-4">
        {items.map((award, i) => (
          <div key={award.id} className="rounded-lg border border-primary p-4 bg-surface-secondary/40 space-y-3">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <span className="text-xs text-muted">Award {i + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={off || i === 0}
                  onClick={() => onChange(moveIndexInArray(items, i, -1))}
                  className="p-1.5 rounded border border-primary text-muted hover:text-foreground disabled:opacity-40"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={off || i === items.length - 1}
                  onClick={() => onChange(moveIndexInArray(items, i, 1))}
                  className="p-1.5 rounded border border-primary text-muted hover:text-foreground disabled:opacity-40"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  disabled={off}
                  onClick={() => {
                    if (items.length === 1 && !confirmRemoveLastListItem('award')) {
                      return;
                    }
                    onChange(items.filter((_, idx) => idx !== i));
                  }}
                  className="p-1.5 rounded border border-error/40 text-error hover:bg-error/10 disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Title</span>
                <input
                  value={award.title}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Organization</span>
                <input
                  value={award.organization}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) => (idx === i ? { ...row, organization: e.target.value } : row)),
                    )
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted block mb-1">Year</span>
                <input
                  value={award.year}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, year: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted block mb-1">Category</span>
                <select
                  value={award.category}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) =>
                        idx === i ? { ...row, category: e.target.value as AboutAwardItem['category'] } : row,
                      ),
                    )
                  }
                  disabled={off}
                  className={careerFieldClass}
                >
                  <option value="research">Research</option>
                  <option value="teaching">Teaching</option>
                  <option value="service">Service</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Details (public)</span>
                <textarea
                  value={award.details}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, details: e.target.value } : row)))
                  }
                  disabled={off}
                  rows={3}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Impact / note</span>
                <textarea
                  value={award.impact}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, impact: e.target.value } : row)))
                  }
                  disabled={off}
                  rows={2}
                  className={careerFieldClass}
                />
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={off}
          onClick={() => onChange([...items, defaultAward()])}
          className="inline-flex items-center gap-2 text-sm text-accent-primary hover:underline disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add award
        </button>
      </div>
    </div>
  );
}
