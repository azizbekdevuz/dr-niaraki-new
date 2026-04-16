'use client';

/**
 * Patents page - Registered and pending patents
 */

import { motion } from 'framer-motion';
import { Globe, Flag, Clock, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useMemo } from 'react';

import { PatentEntryCard } from '@/components/patents/PatentEntryCard';
import { ContentStatTile } from '@/components/shared/ContentStatTile';
import { EmptyStateHint } from '@/components/shared/EmptyStateHint';
import { FilterChipButton } from '@/components/shared/FilterChipButton';
import { ListPagination } from '@/components/shared/ListPagination';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';
import { usePaginatedSlice } from '@/hooks/usePaginatedSlice';
import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Patent types
type PatentFilter = 'all' | 'international' | 'korean' | 'pending';

const PATENTS_PAGE_SIZE = 4;

export default function PatentsPage() {
  const siteContent = usePublicSiteContent();
  const { heroIntro, licensingHeading, licensingBody, stats: patentStats, items: patentItems } =
    siteContent.patents;
  const [filter, setFilter] = useState<PatentFilter>('all');

  // Filter patents
  const filteredPatents = useMemo(() => {
    return patentItems.filter((patent) => {
      if (filter === 'all') {
        return true;
      }
      if (filter === 'pending') {
        return patent.status === 'pending';
      }
      return patent.type === filter;
    });
  }, [filter, patentItems]);

  const patentIds = useMemo(() => patentItems.map((p) => p.id).join('|'), [patentItems]);
  const listResetKey = useMemo(() => `${filter}::${patentIds}`, [filter, patentIds]);

  const {
    slice: pagedPatents,
    page: listPage,
    setPage: setListPage,
    itemCount: filteredCount,
    pageSize: listPageSize,
  } = usePaginatedSlice(filteredPatents, PATENTS_PAGE_SIZE, listResetKey);

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-surface-tertiary to-transparent">
        <div className="container-custom text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${TW_ACCENT_SOFT_GRADIENT}`}
            >
              <Shield className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Patents
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto">
              {heroIntro}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-primary/20 bg-surface-secondary/40 py-10 backdrop-blur-sm">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { label: 'Total Patents', value: `${patentStats.total}+`, icon: Shield },
              { label: 'International (US)', value: `${patentStats.international}`, icon: Globe },
              { label: 'Korean', value: `${patentStats.korean}+`, icon: Flag },
              { label: 'Pending', value: `${patentStats.pending}+`, icon: Clock },
            ].map((stat) => (
              <ContentStatTile key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Patents List */}
      <section className="section">
        <div className="container-custom mx-auto max-w-5xl">
          <SectionHeading eyebrow="Portfolio" title="Filter & explore" icon={Shield} className="!mb-6" />

          <div className="list-page-panel mb-10 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Patents' },
              { value: 'international', label: 'International' },
              { value: 'korean', label: 'Korean' },
              { value: 'pending', label: 'Pending' },
            ].map((option) => (
              <FilterChipButton
                key={option.value}
                selected={filter === option.value}
                onClick={() => setFilter(option.value as PatentFilter)}
              >
                {option.label}
              </FilterChipButton>
            ))}
          </div>

          {/* Patents Grid */}
          {filteredPatents.length === 0 ? (
            <EmptyStateHint
              icon={Shield}
              title='No patents match this filter.'
              hint='Try "All Patents" or another category.'
            />
          ) : (
            <>
              <motion.div
                key={listPage}
                initial={{ opacity: 0.88, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-6 md:grid-cols-2"
              >
                {pagedPatents.map((patent) => (
                  <PatentEntryCard key={patent.id} patent={patent} />
                ))}
              </motion.div>

              <ListPagination
                page={listPage}
                itemCount={filteredCount}
                pageSize={listPageSize}
                onPageChange={setListPage}
                ariaLabel="Patents list pages"
              />
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {licensingHeading}
            </h2>
            <p className="text-muted mb-8 max-w-2xl mx-auto">
              {licensingBody}
            </p>
            <Link href="/contact" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              Get in Touch
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

