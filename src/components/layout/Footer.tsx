'use client';

import clsx from 'clsx';
import {
  ArrowUpRight,
  Briefcase,
  Code2,
  Database,
  Github,
  GraduationCap,
  Linkedin,
  Link2,
  Mail,
  Network,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';
import type { SiteContent } from '@/content/schema';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';

import { SiteWordmark } from './SiteWordmark';

const FOOTER_SOCIAL_ICONS = {
  GraduationCap,
  Linkedin,
  Mail,
} as const;

const FOOTER_SOCIAL_ICON_LEGACY: Record<string, keyof typeof FOOTER_SOCIAL_ICONS> = {
  '🎓': 'GraduationCap',
  '💼': 'Linkedin',
  '📧': 'Mail',
};

type DeveloperLink = SiteContent['layout']['footer']['developerSection']['links'][number];

const DEVELOPER_ICONS: Record<
  DeveloperLink['icon'],
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  github: Github,
  linkedin: Linkedin,
  portfolio: Briefcase,
  mail: Mail,
};

function FooterSocialGlyph({ name }: { name: string }) {
  const resolved =
    FOOTER_SOCIAL_ICON_LEGACY[name] ??
    (name in FOOTER_SOCIAL_ICONS ? (name as keyof typeof FOOTER_SOCIAL_ICONS) : null);
  const Icon = resolved ? FOOTER_SOCIAL_ICONS[resolved] : Link2;
  return <Icon className="h-4 w-4 shrink-0 text-accent-primary/90" aria-hidden />;
}

function DeveloperLinkButton({ link }: { link: DeveloperLink }) {
  const Icon = DEVELOPER_ICONS[link.icon];
  const external = link.href.startsWith('http');
  return (
    <a
      href={link.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={clsx(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-surface-secondary/60 text-foreground/85 touch-manipulation',
        'hover:border-accent-primary/45 hover:bg-accent-primary/10 hover:text-accent-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
        '[-webkit-tap-highlight-color:transparent]',
      )}
      aria-label={link.label}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
    </a>
  );
}

export default function Footer() {
  const { isMobile } = useDevice();
  const siteContent = usePublicSiteContent();
  const currentYear = new Date().getFullYear();
  const {
    aboutHeading,
    aboutBlurb,
    quickLinks,
    socialLinks,
    copyrightName,
    researchFocusTitle,
    researchFocusItems,
    developerSection,
  } = siteContent.layout.footer;

  return (
    <footer className="relative z-10 mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

      <div className="glass">
        <div className="container-custom py-10 md:py-14">
          <div
            className={clsx(
              'grid gap-10',
              isMobile ? 'grid-cols-1' : 'grid-cols-1 gap-x-10 md:grid-cols-3',
            )}
          >
            <div className="flex flex-col gap-4">
              <SiteWordmark variant="footer" />
              <p className="text-sm font-medium text-accent-primary/90">{aboutHeading}</p>
              <p className="max-w-md text-sm leading-relaxed text-foreground/70">{aboutBlurb}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      'inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-surface-secondary/50 touch-manipulation',
                      'hover:border-accent-primary/45 hover:bg-accent-primary/10 hover:text-accent-primary',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                      '[-webkit-tap-highlight-color:transparent]',
                    )}
                    aria-label={`${link.label} (opens in a new tab)`}
                  >
                    <FooterSocialGlyph name={link.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground md:text-lg">
                <Database className="h-5 w-5 shrink-0 text-accent-primary" aria-hidden />
                {researchFocusTitle}
              </h3>
              <ul className="space-y-3">
                {researchFocusItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-primary/15 bg-surface-secondary/30 px-3 py-2.5 text-sm text-foreground/85"
                  >
                    <Network
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary/90"
                      aria-hidden
                    />
                    <span className="leading-snug">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground md:text-lg">
                <Code2 className="h-5 w-5 shrink-0 text-accent-primary" aria-hidden />
                {developerSection.sectionTitle}
              </h3>
              <div className="rounded-2xl border border-primary/20 bg-surface-secondary/35 p-4 shadow-inner backdrop-blur-sm md:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {developerSection.introLine}
                </p>
                <p className="mt-2 text-lg font-semibold text-accent-primary md:text-xl">
                  {developerSection.name}
                </p>
                <p className="mt-0.5 text-sm text-foreground/65">{developerSection.role}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {developerSection.links.map((link) => (
                    <DeveloperLinkButton key={`${link.icon}-${link.href}`} link={link} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-primary/20 pt-8 md:mt-12 md:pt-10">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
              Quick links
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-md text-sm text-foreground/70 touch-manipulation',
                      'hover:text-accent-primary',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                    )}
                    aria-label={link.label}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-primary/25 pt-6 md:mt-10 md:pt-8">
            <p className="text-center text-xs text-foreground/50">
              © {currentYear} {copyrightName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
