'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { ExperienceEditorRow } from '@/lib/draftEditorSlice';
import { moveIndexInArray } from '@/lib/draftEditorSlice';

import { careerFieldClass, confirmRemoveLastListItem, defaultExperience } from './draftEditorCareerShared';

type Props = {
  items: ExperienceEditorRow[];
  disabled: boolean;
  onChange: (next: ExperienceEditorRow[]) => void;
};

export function DraftEditorExperiencesList({ items, disabled, onChange }: Props) {
  const off = disabled;

  return (
    <div>
      <h3 className="text-sm font-semibold text-secondary mb-1">Professional experience</h3>
      <p className="text-xs text-muted mb-4">
        Appointments shown under “Professional Experience”. One bullet per line for achievements.
      </p>
      <div className="space-y-4">
        {items.map((exp, i) => (
          <div key={exp.id} className="rounded-lg border border-primary p-4 bg-surface-secondary/40 space-y-3">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <span className="text-xs text-muted">Role {i + 1}</span>
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
                    if (items.length === 1 && !confirmRemoveLastListItem('professional experience')) {
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
                <span className="text-xs text-muted block mb-1">Position</span>
                <input
                  value={exp.position}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, position: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Institution</span>
                <input
                  value={exp.institution}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) => (idx === i ? { ...row, institution: e.target.value } : row)),
                    )
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Duration</span>
                <input
                  value={exp.duration}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, duration: e.target.value } : row)))
                  }
                  disabled={off}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Type</span>
                <select
                  value={exp.type}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) =>
                        idx === i ? { ...row, type: e.target.value as ExperienceEditorRow['type'] } : row,
                      ),
                    )
                  }
                  disabled={off}
                  className={careerFieldClass}
                >
                  <option value="academic">Academic</option>
                  <option value="research">Research</option>
                  <option value="consulting">Consulting</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Details</span>
                <textarea
                  value={exp.details}
                  onChange={(e) =>
                    onChange(items.map((row, idx) => (idx === i ? { ...row, details: e.target.value } : row)))
                  }
                  disabled={off}
                  rows={3}
                  className={careerFieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted block mb-1">Achievements (one per line)</span>
                <textarea
                  value={exp.achievementsText}
                  onChange={(e) =>
                    onChange(
                      items.map((row, idx) => (idx === i ? { ...row, achievementsText: e.target.value } : row)),
                    )
                  }
                  disabled={off}
                  rows={4}
                  className={careerFieldClass}
                />
              </label>
              <p className="text-xs text-muted sm:col-span-2">
                Project lines from the database are kept on save but are not edited here (not shown on the public
                About page yet).
              </p>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={off}
          onClick={() => onChange([...items, defaultExperience()])}
          className="inline-flex items-center gap-2 text-sm text-accent-primary hover:underline disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add experience
        </button>
      </div>
    </div>
  );
}
