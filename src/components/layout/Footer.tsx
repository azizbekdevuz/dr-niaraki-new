'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';

export default function Footer() {
  const { isMobile } = useDevice();
  const siteContent = usePublicSiteContent();
  const currentYear = new Date().getFullYear();
  const { aboutHeading, aboutBlurb, quickLinks, socialLinks, copyrightName } = siteContent.layout.footer;

  return (
    <footer className="relative z-10 mt-auto">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />
      
      <div className="glass">
        <div className="container-custom py-8 md:py-12">
          <div className={`grid gap-6 md:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {/* About Section */}
            <div>
              <h3 className="text-base md:text-lg font-semibold gradient-text mb-3 md:mb-4">
                {aboutHeading}
              </h3>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                {aboutBlurb}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      aria-label={link.label}
                      title="Quick Link"
                      href={link.href}
                      className="inline-flex items-center gap-1 text-xs md:text-sm text-foreground/70 hover:text-accent-primary transition-colors duration-fast gpu-accelerated"
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true">
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Connect</h3>
              <div className="space-y-2 md:space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs md:text-sm text-foreground/70 hover:text-accent-primary transition-colors duration-fast gpu-accelerated"
                    aria-label={`Visit ${link.label} (opens in a new tab)`}
                    title={`Visit ${link.label} (opens in new tab)`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-primary">
            <p className="text-xs text-foreground/50 text-center">
              © {currentYear} {copyrightName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
