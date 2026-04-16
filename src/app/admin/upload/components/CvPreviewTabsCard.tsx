'use client';

import React from 'react';

import type { Details } from '@/types/details';

import { cvPreviewTabClasses } from '../uploadPreviewTabStyles';
import type { CvPreviewTabId } from '../uploadTypes';
import { CV_PREVIEW_TAB_ORDER } from '../uploadTypes';

import { CvPreviewContent } from './CvPreviewContent';

type Props = {
  data: Details;
  activeTab: CvPreviewTabId;
  onTabChange: (tab: CvPreviewTabId) => void;
};

export function CvPreviewTabsCard({ data, activeTab, onTabChange }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-primary">
        {CV_PREVIEW_TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cvPreviewTabClasses(activeTab === tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-6 max-h-[500px] overflow-y-auto">
        <CvPreviewContent data={data} tab={activeTab} />
      </div>
    </div>
  );
}
