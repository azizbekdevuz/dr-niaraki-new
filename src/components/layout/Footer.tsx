'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';


const quickLinks = [
  { href: '/research', label: 'Research Areas' },
  { href: '/publications', label: 'Recent Publications' },
  { href: '/patents', label: 'Patents' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = [
  { 
    href: 'https://scholar.google.com/citations?user=-V8_A5YAAAAJ&hl=en', 
    label: 'Google Scholar',
    icon: '🎓'
  },
  { 
    href: 'https://www.linkedin.com/in/abolghasemsadeghi-n/', 
    label: 'LinkedIn',
    icon: '💼'
  },
  { 
    href: 'mailto:a.sadeghi@sejong.ac.kr', 
    label: 'Email',
    icon: '📧'
  },
];

export default function Footer() {
  const { isMobile } = useDevice();
  const currentYear = new Date().getFullYear();

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
                Dr. Sadeghi-Niaraki
              </h3>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                Associate Professor at Sejong University, specializing in Extended Reality, 
                Artificial Intelligence, and Geospatial Information Systems.
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
              © {currentYear} Dr. Abolghasem Sadeghi-Niaraki. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
