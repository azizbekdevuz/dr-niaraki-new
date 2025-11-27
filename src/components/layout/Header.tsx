'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';

import { NAV_ITEMS } from './constants';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useDevice();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-fixed transition-all duration-300 gpu-accelerated',
          isScrolled ? 'glass shadow-lg' : 'bg-transparent'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between py-3 md:py-4">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-lg md:text-xl lg:text-2xl font-bold gradient-text transition-gpu hover:scale-105 gpu-accelerated"
            >
              Dr. Sadeghi-Niaraki
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <ul className="flex items-center space-x-6 lg:space-x-8">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'relative py-2 px-1 transition-colors duration-fast',
                        pathname === item.href
                          ? 'text-accent-primary'
                          : 'text-foreground/70 hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        {item.label}
                      </span>
                      {pathname === item.href && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative w-10 h-10 flex items-center justify-center gpu-accelerated"
                aria-label="Toggle menu"
              >
                <div className="w-6 flex flex-col gap-1.5">
                  <span 
                    className={clsx(
                      'block h-0.5 bg-foreground transition-all duration-300',
                      isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                    )}
                  />
                  <span 
                    className={clsx(
                      'block h-0.5 bg-foreground transition-all duration-300',
                      isMobileMenuOpen ? 'opacity-0' : ''
                    )}
                  />
                  <span 
                    className={clsx(
                      'block h-0.5 bg-foreground transition-all duration-300',
                      isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                    )}
                  />
                </div>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div
          className={clsx(
            'fixed inset-0 z-modal transition-opacity duration-300',
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-overlay-medium backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div
            className={clsx(
              'absolute right-0 top-0 h-full w-64 glass shadow-2xl transition-transform duration-300 gpu-accelerated',
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {/* Mobile Navigation */}
            <nav className="pt-20 px-6">
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-fast gpu-accelerated',
                        pathname === item.href
                          ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary'
                          : 'text-foreground/70 hover:bg-surface-hover hover:text-foreground'
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Additional mobile menu info */}
              <div className="mt-8 pt-8 border-t border-primary">
                <p className="text-sm text-foreground/60 text-center">
                  Dr. Abolghasem Sadeghi-Niaraki
                </p>
                <p className="text-xs text-foreground/50 text-center mt-1">
                  Sejong University
                </p>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
