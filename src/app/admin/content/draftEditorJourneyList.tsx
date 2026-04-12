'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { AboutJourneyItem } from '@/content/schema';
import { moveIndexInArray } from '@/lib/draftEditorSlice';

import { careerFieldClass, confirmRemoveLastListItem, defaultJourney } from './draftEditorCareerShared';

type Props = {
  items: AboutJourneyItem[];
  disabled: boolean;
  onChange: (next: AboutJourneyItem[]) => void;
};

export function DraftEditorJourneyList({ items, disabled, onChange }: Props) {
  const off = disabled;

  return (
    <div>
      <h3 className="text-sm font-semibold text-secondary mb-1">Academic journey</h3>
      <p className="text-xs text-muted mb-4">
        Timeline shown under “Academic Journey” on the About page (education and major roles).
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border border-primary p-4 bg-surface-secondary/40 space-y-3">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <span className="text-xs text-muted">Item {i + 1}</span>
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
                    if (items.length === 1 && !confirmRemoveLastListItem('academic journey entry')) {
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
                  value={item.title}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Institution</span>
                <input
                  value={item.institution}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) => (idx === i ? { ...row, institution: e.target.value } : row)),
                    )
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted block mb-1">Period</span>
                <input
                  value={item.year}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, year: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Details</span>
                <textarea
                  value={item.details}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, details: e.target.value } : row)))
                  }
                  disabled={off}
                  rows={3}
                  className={careerFieldClass}
                />
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={off}
          onClick={() => onChange([...items, defaultJourney()])}
          className="inline-flex items-center gap-2 text-sm text-accent-primary hover:underline disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add journey entry
        </button>
      </div>
    </div>
  );
}
