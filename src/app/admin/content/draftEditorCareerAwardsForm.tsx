'use client';

import React from 'react';

import type { DraftEditorSlice } from '@/lib/draftEditorSlice';

import { DraftEditorAwardsList } from './draftEditorAwardsList';
import { DraftEditorExperiencesList } from './draftEditorExperiencesList';
import { DraftEditorJourneyList } from './draftEditorJourneyList';

type DraftEditorCareerAwardsFormProps = {
  slice: DraftEditorSlice;
  disabled: boolean;
  onSliceChange: (next: DraftEditorSlice) => void;
};

export function DraftEditorCareerAwardsForm({ slice, disabled, onSliceChange }: DraftEditorCareerAwardsFormProps) {
  return (
    <div className="space-y-10 border-t border-primary pt-8 mt-8">
      <DraftEditorJourneyList
        items={slice.journey}
        disabled={disabled}
        onChange={(journey) => onSliceChange({ ...slice, journey })}
      />
      <DraftEditorExperiencesList
        items={slice.experiences}
        disabled={disabled}
        onChange={(experiences) => onSliceChange({ ...slice, experiences })}
      />
      <DraftEditorAwardsList
        items={slice.awards}
        disabled={disabled}
        onChange={(awards) => onSliceChange({ ...slice, awards })}
      />
    </div>
  );
}
