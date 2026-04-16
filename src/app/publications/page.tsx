'use client';

/**
 * Publications page - Academic publications and citations
 */

import { motion } from 'framer-motion';
import {
  FileText,
  Book,
  BookOpen,
  ExternalLink,
  Search,
  Calendar,
  Award,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { PublicationEntryCard } from '@/components/publications/PublicationEntryCard';
import type { PublicationTypeFilter } from '@/components/publications/publicationLabels';
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

const PUBLICATIONS_PAGE_SIZE = 5;

export default function PublicationsPage() {
  const siteContent = usePublicSiteContent();
  const { heroIntro, scholarUrl, stats: publicationStats, items: publicationItems } =
    siteContent.publications;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PublicationTypeFilter>('all');
  const [yearSort, setYearSort] = useState<'desc' | 'asc'>('desc');

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    return publicationItems
      .filter((pub) => {
        const matchesSearch =
          searchQuery === '' ||
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.journal.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || pub.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        return yearSort === 'desc' ? b.year - a.year : a.year - b.year;
      });
  }, [searchQuery, typeFilter, yearSort, publicationItems]);

  const publicationIds = useMemo(
    () => publicationItems.map((p) => p.id).join('|'),
    [publicationItems],
  );
  const listResetKey = useMemo(
    () => `${searchQuery}::${typeFilter}::${yearSort}::${publicationIds}`,
    [searchQuery, typeFilter, yearSort, publicationIds],
  );

  const {
    slice: pagedPublications,
    page: listPage,
    setPage: setListPage,
    itemCount: filteredCount,
    pageSize: listPageSize,
  } = usePaginatedSlice(filteredPublications, PUBLICATIONS_PAGE_SIZE, listResetKey);

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
              <FileText className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Publications
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto mb-8">
              {heroIntro}
            </motion.p>
            
            {/* Google Scholar Link */}
            <motion.a
              variants={itemVariants}
              href={scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
              <Award className="w-5 h-5" />
              View on Google Scholar
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-primary/20 bg-surface-secondary/40 py-10 backdrop-blur-sm">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
            {[
              { label: 'Total Publications', value: `${publicationStats.total}+`, icon: FileText },
              { label: 'Journal Papers', value: `${publicationStats.journals}+`, icon: BookOpen },
              { label: 'Conferences', value: `${publicationStats.conferences}+`, icon: FileText },
              { label: 'Books', value: `${publicationStats.books}`, icon: Book },
              { label: 'Ph.D. advised', value: `${publicationStats.phdAdvised}+`, icon: Award },
            ].map((stat) => (
              <ContentStatTile key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="section">
        <div className="container-custom mx-auto max-w-5xl">
          <SectionHeading eyebrow="Library" title="Browse & filter" icon={Search} className="!mb-6" />

          <div className="list-page-panel mb-10 flex flex-col gap-4 md:flex-row md:items-stretch">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-full min-h-11 w-full rounded-xl border border-primary/40 bg-background/40 py-3 pl-10 pr-4 text-foreground outline-none ring-accent-primary/30 transition-all placeholder:text-muted/70 focus:border-accent-primary focus:ring-2"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2 md:items-center">
              {(['all', 'journal', 'conference', 'book'] as PublicationTypeFilter[]).map((type) => (
                <FilterChipButton
                  key={type}
                  selected={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === 'all' ? 'All' : `${type.charAt(0).toUpperCase()}${type.slice(1)}s`}
                </FilterChipButton>
              ))}
            </div>

            {/* Sort */}
            <button
              type="button"
              onClick={() => setYearSort(yearSort === 'desc' ? 'asc' : 'desc')}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-surface-secondary/60 px-4 py-2.5 font-medium text-muted transition-all hover:border-accent-primary/40 hover:text-foreground md:min-w-[11rem]"
            >
              <Calendar className="h-4 w-4 shrink-0 text-accent-primary" />
              <span>{yearSort === 'desc' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>

          {/* Publications List */}
          {filteredPublications.length === 0 ? (
            <EmptyStateHint
              icon={FileText}
              title="No publications match this view."
              hint="Try clearing search or switching the type filter."
            />
          ) : (
            <>
              <motion.div
                key={listPage}
                initial={{ opacity: 0.88, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {pagedPublications.map((pub) => (
                  <PublicationEntryCard key={pub.id} publication={pub} />
                ))}
              </motion.div>

              <ListPagination
                page={listPage}
                itemCount={filteredCount}
                pageSize={listPageSize}
                onPageChange={setListPage}
                ariaLabel="Publications list pages"
              />
            </>
          )}

          {/* Load More / See All */}
          <div className="mt-8 text-center">
            <a
              href={scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3 inline-flex items-center gap-2"
            >
              View All on Google Scholar
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

