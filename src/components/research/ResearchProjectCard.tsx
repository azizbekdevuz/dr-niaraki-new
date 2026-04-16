'use client';

import { Calendar, DollarSign, FolderGit2, Users } from 'lucide-react';
import React from 'react';

import { MetaFactRow } from '@/components/shared/MetaFactRow';
import type { SiteContent } from '@/content/schema';

type ResearchProject = SiteContent['research']['projects'][number];

export type ResearchProjectCardProps = {
  project: ResearchProject;
};

export function ResearchProjectCard({ project }: ResearchProjectCardProps) {
  return (
    <div className="card card-rich p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                project.status === 'ongoing'
                  ? 'bg-success/15 text-success ring-1 ring-success/25'
                  : 'bg-muted/15 text-muted ring-1 ring-primary/15'
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-secondary">{project.description}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetaFactRow icon={Calendar}>{project.period}</MetaFactRow>
        <MetaFactRow icon={Users}>{project.role}</MetaFactRow>
        <MetaFactRow icon={DollarSign}>{project.amount}</MetaFactRow>
        <MetaFactRow icon={FolderGit2}>{project.funding}</MetaFactRow>
      </div>
    </div>
  );
}
