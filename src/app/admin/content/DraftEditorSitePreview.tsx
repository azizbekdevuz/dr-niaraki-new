'use client';

import React, { useState } from 'react';

import type { SiteContent } from '@/content/schema';
import type { DraftEditorSlice } from '@/lib/draftEditorSlice';

import { DraftEditorPreviewAboutLists } from './DraftEditorPreviewAboutLists';

type PreviewTab = 'home' | 'about' | 'contact' | 'research' | 'publications' | 'patents';

const tabBtn =
  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary';

function ScrollPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`max-h-[min(36rem,78vh)] overflow-y-auto rounded-md border border-primary/10 bg-surface/30 px-3 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function DraftEditorSitePreview({
  slice,
  siteContext,
}: {
  slice: DraftEditorSlice;
  siteContext: SiteContent;
}) {
  const [tab, setTab] = useState<PreviewTab>('home');

  const pub = siteContext.publications;
  const pat = siteContext.patents;
  const res = siteContext.research;

  return (
    <div className="rounded-lg border border-primary/20 bg-surface-secondary/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live draft preview</p>
      <p className="mt-1 text-xs text-muted">
        Edited fields below reflect your current draft inputs. Research, publications, and patents mirror the loaded
        site draft (unchanged by this editor) so you can sanity-check surrounding public surfaces.
      </p>
      <div className="mt-3 flex flex-wrap gap-1 border-b border-primary/15 pb-2" role="tablist" aria-label="Preview target page">
        {(
          [
            ['home', 'Home / hero'],
            ['about', 'About'],
            ['contact', 'Contact'],
            ['research', 'Research'],
            ['publications', 'Publications'],
            ['patents', 'Patents'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-testid={`draft-preview-tab-${id}`}
            aria-selected={tab === id}
            className={`${tabBtn} ${
              tab === id ? 'bg-accent-primary/15 text-accent-primary' : 'text-muted hover:text-foreground'
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 text-sm" role="tabpanel" data-testid="draft-preview-panel">
        {tab === 'home' ? (
          <ScrollPanel>
            <div className="space-y-3" data-testid="draft-preview-home">
              <p className="text-lg font-semibold text-foreground">{slice.profile.displayName || '—'}</p>
              <p className="text-accent-primary/90">{slice.profile.roleLine || '—'}</p>
              <div>
                <p className="text-xs font-medium text-muted">Home intro</p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {slice.profile.homeAboutIntro || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">About tagline (home)</p>
                <p className="mt-1 whitespace-pre-wrap text-muted">{slice.profile.aboutIntroTagline || '—'}</p>
              </div>
            </div>
          </ScrollPanel>
        ) : null}

        {tab === 'about' ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted">Professional summary (about page)</p>
              <ScrollPanel className="mt-1">
                <p className="whitespace-pre-wrap text-foreground/90">{slice.aboutProfessionalSummaryText || '—'}</p>
              </ScrollPanel>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Journey ({slice.journey.length})</p>
              <ScrollPanel className="mt-1">
                <ul className="list-inside list-decimal space-y-2 text-muted">
                  {slice.journey.map((j) => (
                    <li key={j.id} className="pl-1">
                      <span className="text-foreground">{j.title}</span> — {j.institution}{' '}
                      <span className="text-muted">({j.year})</span>
                      {j.details ? (
                        <p className="mt-0.5 whitespace-pre-wrap text-xs text-foreground/80">{j.details}</p>
                      ) : null}
                    </li>
                  ))}
                  {slice.journey.length === 0 ? <li>—</li> : null}
                </ul>
              </ScrollPanel>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Appointments ({slice.experiences.length})</p>
              <ScrollPanel className="mt-1">
                <ul className="list-inside list-decimal space-y-2 text-muted">
                  {slice.experiences.map((e) => (
                    <li key={e.id} className="pl-1">
                      <span className="text-foreground">{e.position}</span> @ {e.institution}{' '}
                      <span className="text-muted">({e.duration})</span>
                      {e.details ? (
                        <p className="mt-0.5 whitespace-pre-wrap text-xs text-foreground/80">{e.details}</p>
                      ) : null}
                    </li>
                  ))}
                  {slice.experiences.length === 0 ? <li>—</li> : null}
                </ul>
              </ScrollPanel>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Awards ({slice.awards.length})</p>
              <ScrollPanel className="mt-1">
                <ul className="list-inside list-decimal space-y-2 text-muted">
                  {slice.awards.map((a) => (
                    <li key={a.id} className="pl-1">
                      <span className="text-foreground">{a.title}</span>
                      {a.organization ? <span> — {a.organization}</span> : null}
                      {a.year ? <span className="text-muted"> ({a.year})</span> : null}
                    </li>
                  ))}
                  {slice.awards.length === 0 ? <li>—</li> : null}
                </ul>
              </ScrollPanel>
            </div>
            <DraftEditorPreviewAboutLists slice={slice} />
          </div>
        ) : null}

        {tab === 'contact' ? (
          <ScrollPanel>
            <dl className="space-y-3 text-muted">
              <div>
                <dt className="text-xs font-medium text-muted">Official email</dt>
                <dd className="break-all text-foreground">{slice.contact.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Personal email</dt>
                <dd className="break-all text-foreground">{slice.contact.personalEmail || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Website</dt>
                <dd className="break-all text-foreground">{slice.contact.websiteDisplay || '—'}</dd>
              </div>
            </dl>
          </ScrollPanel>
        ) : null}

        {tab === 'research' ? (
          <ScrollPanel>
            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-muted">
                Static research page copy + lists from draft site content (not edited in this form).
              </p>
              <div>
                <p className="font-medium text-foreground">Hero intro</p>
                <p className="mt-1 whitespace-pre-wrap text-muted">{res.heroIntro}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Collaboration</p>
                <p className="mt-1 font-medium text-foreground/90">{res.collaborationHeading}</p>
                <p className="mt-1 whitespace-pre-wrap text-muted">{res.collaborationBody}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Interests ({res.interests.length})</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-muted">
                  {res.interests.map((it) => (
                    <li key={it.id}>
                      <span className="text-foreground">{it.name}</span>
                      {it.description ? (
                        <span className="block whitespace-pre-wrap text-[11px] text-foreground/75">{it.description}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Projects ({res.projects.length})</p>
                <ul className="mt-1 list-disc space-y-1.5 pl-4 text-muted">
                  {res.projects.map((p) => (
                    <li key={p.id}>
                      <span className="text-foreground">{p.title}</span>
                      {p.period ? <span className="text-muted"> — {p.period}</span> : null}
                      {p.description ? (
                        <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-foreground/80">{p.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="border-t border-primary/10 pt-2 text-[11px] text-muted">
                Draft simple lists (same rows as the About preview): {slice.teaching.length} teaching ·{' '}
                {slice.supervision.length} supervision · {slice.service.length} service. Loaded site draft (saved)
                currently: {siteContext.teaching.length} / {siteContext.supervision.length} / {siteContext.service.length}.
              </p>
            </div>
          </ScrollPanel>
        ) : null}

        {tab === 'publications' ? (
          <ScrollPanel>
            <div className="space-y-3 text-xs">
              <p className="font-medium text-foreground">
                {pub.stats.total} total · {pub.stats.journals} journals · {pub.stats.conferences} conferences ·{' '}
                {pub.stats.books} books
              </p>
              <ul className="list-decimal space-y-2 pl-4 text-muted">
                {pub.items.map((p) => (
                  <li key={p.id} className="break-words pl-1">
                    <span className="text-foreground">{p.title}</span>{' '}
                    <span className="text-muted">
                      ({p.year}) {p.journal ? `· ${p.journal}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollPanel>
        ) : null}

        {tab === 'patents' ? (
          <ScrollPanel>
            <div className="space-y-3 text-xs">
              <p className="text-muted">{pat.items.length} patent rows in draft site content.</p>
              <ul className="list-decimal space-y-2 pl-4 text-muted">
                {pat.items.map((p) => (
                  <li key={p.id} className="break-words pl-1">
                    <span className="text-foreground">{p.title}</span>
                    <span className="block text-[11px] text-foreground/80">
                      {p.number} · {p.country} · {p.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollPanel>
        ) : null}
      </div>
    </div>
  );
}
