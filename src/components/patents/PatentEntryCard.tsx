'use client';

import { Calendar, CheckCircle, Clock, Flag, Globe, Shield } from 'lucide-react';
import React from 'react';

import type { PatentItem } from '@/content/schema';

export type PatentEntryCardProps = {
  patent: PatentItem;
};

export function PatentEntryCard({ patent }: PatentEntryCardProps) {
  const StatusIcon = patent.status === 'registered' ? CheckCircle : Clock;
  const statusColor = patent.status === 'registered' ? 'text-success' : 'text-warning';

  return (
    <article className="card card-rich p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {patent.country === 'US' ? (
            <Globe className="h-5 w-5 text-accent-primary" aria-hidden />
          ) : (
            <Flag className="h-5 w-5 text-accent-secondary" aria-hidden />
          )}
          <span className="text-sm text-muted">{patent.country}</span>
        </div>
        <div className={`flex items-center gap-1 ${statusColor}`}>
          <StatusIcon className="h-4 w-4" aria-hidden />
          <span className="text-xs capitalize">{patent.status}</span>
        </div>
      </div>

      <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-foreground">{patent.title}</h3>

      <div className="space-y-2 text-sm text-muted">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-mono text-xs md:text-sm">{patent.number}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden />
          <span>{patent.date}</span>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted">
        Inventors: {patent.inventors}
      </p>
    </article>
  );
}
