'use client';

import React from 'react';

import type { Details } from '@/types/details';

import type { CvPreviewTabId } from '../uploadTypes';

type Props = {
  data: Details;
  tab: CvPreviewTabId;
};

export function CvPreviewContent({ data, tab }: Props) {
  switch (tab) {
    case 'profile':
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{data.profile.name}</h3>
          <p className="text-muted">{data.profile.title}</p>
          <p className="text-secondary text-sm">{data.profile.summary?.slice(0, 500)}...</p>
        </div>
      );

    case 'about':
      return (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Education ({data.about.education.length})</h4>
            <ul className="space-y-2">
              {data.about.education.slice(0, 5).map((edu) => (
                <li key={edu.id} className="text-sm text-muted">
                  <span className="text-foreground">{edu.degree}</span> - {edu.institution}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Positions ({data.about.positions.length})</h4>
            <ul className="space-y-2">
              {data.about.positions.slice(0, 5).map((pos) => (
                <li key={pos.id} className="text-sm text-muted">
                  <span className="text-foreground">{pos.title}</span> @ {pos.institution}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'publications':
      return (
        <div>
          <h4 className="font-medium text-foreground mb-4">Publications ({data.publications.length})</h4>
          <ul className="space-y-3">
            {data.publications.slice(0, 10).map((pub) => (
              <li key={pub.id} className="text-sm p-3 bg-surface-secondary rounded">
                <p className="text-foreground">{pub.title}</p>
                <p className="text-muted text-xs mt-1">
                  {pub.year ? <span>({pub.year})</span> : null} {pub.journal ? <span>• {pub.journal}</span> : null}
                </p>
              </li>
            ))}
            {data.publications.length > 10 ? (
              <li className="text-accent-primary text-sm">...and {data.publications.length - 10} more</li>
            ) : null}
          </ul>
        </div>
      );

    case 'patents':
      return (
        <div>
          <h4 className="font-medium text-foreground mb-4">Patents ({data.patents.length})</h4>
          <ul className="space-y-3">
            {data.patents.slice(0, 10).map((patent) => (
              <li key={patent.id} className="text-sm p-3 bg-surface-secondary rounded">
                <p className="text-foreground">{patent.title}</p>
                <p className="text-muted text-xs mt-1">
                  {patent.number ? <span>{patent.number}</span> : null}{' '}
                  {patent.status ? <span>• {patent.status}</span> : null}
                </p>
              </li>
            ))}
            {data.patents.length > 10 ? (
              <li className="text-accent-primary text-sm">...and {data.patents.length - 10} more</li>
            ) : null}
          </ul>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-3">
          {data.contact.email ? (
            <p className="text-sm">
              <span className="text-muted">Email:</span> <span className="text-foreground">{data.contact.email}</span>
            </p>
          ) : null}
          {data.contact.phone ? (
            <p className="text-sm">
              <span className="text-muted">Phone:</span> <span className="text-foreground">{data.contact.phone}</span>
            </p>
          ) : null}
          {data.contact.website ? (
            <p className="text-sm">
              <span className="text-muted">Website:</span>{' '}
              <span className="text-foreground">{data.contact.website}</span>
            </p>
          ) : null}
          {data.contact.address ? (
            <p className="text-sm">
              <span className="text-muted">Address:</span>{' '}
              <span className="text-foreground">{data.contact.address}</span>
            </p>
          ) : null}
          {data.contact.social.linkedin ? (
            <p className="text-sm">
              <span className="text-muted">LinkedIn:</span>{' '}
              <span className="text-foreground">{data.contact.social.linkedin}</span>
            </p>
          ) : null}
        </div>
      );

    default:
      return null;
  }
}
